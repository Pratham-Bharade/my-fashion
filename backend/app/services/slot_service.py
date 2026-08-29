from datetime import date, time, datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.appointment import Appointment, AppointmentStatus
from app.models.settings import BusinessSettings
from app.schemas.appointment import AvailableSlot
from app.core.exceptions import AppException

class SlotService:
    SLOT_DURATION_MINUTES = 45

    def _parse_time_str(self, time_str: str) -> time:
        """Flexibly parses time strings formatted as '%H:%M', '%I:%M %p', '%I:%M%p', etc."""
        cleaned = time_str.strip()
        formats = [
            "%H:%M",
            "%H:%M:%S",
            "%I:%M %p",
            "%I:%M%p",
            "%I:%M",
            "%I %p",
            "%I%p",
        ]
        for fmt in formats:
            try:
                return datetime.strptime(cleaned, fmt).time()
            except ValueError:
                continue

        # Fallback manual extraction
        try:
            is_pm = "PM" in cleaned.upper()
            is_am = "AM" in cleaned.upper()
            digits = "".join(c for c in cleaned if c.isdigit() or c == ":")
            parts = digits.split(":")
            h = int(parts[0])
            m = int(parts[1]) if len(parts) > 1 else 0
            if is_pm and h < 12:
                h += 12
            elif is_am and h == 12:
                h = 0
            return time(h, m)
        except Exception:
            return time(10, 30)

    def get_available_slots_for_date(self, db: Session, target_date: date) -> List[AvailableSlot]:
        """
        Calculates all appointment slots for a given date based on business hours,
        holidays, and existing active appointments.
        """
        if target_date < date.today():
            return []

        # 1. Fetch business settings
        settings_record = db.query(BusinessSettings).first()
        day_name = target_date.strftime("%A").lower()

        open_time_str = "10:00"
        close_time_str = "20:00"

        if settings_record:
            # Check holiday
            target_date_str = target_date.isoformat()
            if settings_record.holidays and target_date_str in settings_record.holidays:
                return []

            # Check day working hours
            hours_config = settings_record.working_hours or {}
            day_config = hours_config.get(day_name, {})
            if day_config.get("is_closed", False):
                return []
            open_time_str = day_config.get("open", "10:00")
            close_time_str = day_config.get("close", "20:00")

        open_t = self._parse_time_str(open_time_str)
        close_t = self._parse_time_str(close_time_str)

        open_dt = datetime.combine(target_date, open_t)
        close_dt = datetime.combine(target_date, close_t)

        # 2. Query booked appointments for the date
        active_appointments = db.query(Appointment).filter(
            Appointment.appointment_date == target_date,
            Appointment.status.in_([
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED
            ])
        ).all()

        booked_slots = [
            (apt.start_time.strftime("%H:%M"), apt.end_time.strftime("%H:%M"))
            for apt in active_appointments if apt.start_time and apt.end_time
        ]

        # 3. Generate time intervals
        slots: List[AvailableSlot] = []
        current_dt = open_dt
        now = datetime.now()

        while current_dt + timedelta(minutes=self.SLOT_DURATION_MINUTES) <= close_dt:
            slot_start_time = current_dt.time()
            slot_end_dt = current_dt + timedelta(minutes=self.SLOT_DURATION_MINUTES)
            slot_end_time = slot_end_dt.time()

            slot_start_str = slot_start_time.strftime("%I:%M %p")
            slot_end_str = slot_end_time.strftime("%I:%M %p")
            slot_24h_str = slot_start_time.strftime("%H:%M")

            # Check if in past if target date is today
            is_past = (target_date == date.today() and current_dt < now)

            # Check conflict with booked slots
            is_booked = any(
                b_start == slot_24h_str for b_start, _ in booked_slots
            )

            is_available = (not is_past) and (not is_booked)

            slots.append(AvailableSlot(
                date=target_date,
                start_time=slot_start_str,
                end_time=slot_end_str,
                is_available=is_available
            ))

            current_dt += timedelta(minutes=self.SLOT_DURATION_MINUTES)

        return slots

    def validate_and_reserve_slot(
        self,
        db: Session,
        target_date: date,
        start_time_str: str
    ) -> Tuple[time, time]:
        """
        Validates that the slot is in the future, falls in working hours, and is not already booked.
        Returns (start_time, end_time).
        """
        if target_date < date.today():
            raise AppException(status_code=400, message="Cannot book an appointment for a past date.")

        parsed_start_t = self._parse_time_str(start_time_str)
        start_dt = datetime.combine(target_date, parsed_start_t)
        end_dt = start_dt + timedelta(minutes=self.SLOT_DURATION_MINUTES)
        parsed_end_t = end_dt.time()

        # Check if booking is in the past for today
        if target_date == date.today() and start_dt < datetime.now():
            raise AppException(status_code=400, message="This time slot has already passed for today.")

        # Check existing conflicting active appointments on that date
        existing_conflict = db.query(Appointment).filter(
            Appointment.appointment_date == target_date,
            Appointment.start_time == parsed_start_t,
            Appointment.status.in_([
                AppointmentStatus.PENDING,
                AppointmentStatus.CONFIRMED
            ])
        ).first()

        if existing_conflict:
            raise AppException(
                status_code=409,
                message=f"Time slot {start_time_str} on {target_date.strftime('%d %b %Y')} is already reserved by another customer."
            )

        return parsed_start_t, parsed_end_t

slot_service = SlotService()
