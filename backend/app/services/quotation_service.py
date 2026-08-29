from typing import Optional
from sqlalchemy.orm import Session
from app.models.quotation import Quotation, QuotationStatus
from app.models.custom_request import CustomRequest, CustomRequestStatus
from app.models.order import Order, OrderStatus
from app.services.order_service import order_service
from app.services.notification_service import notification_service
from app.models.notification import NotificationType
from app.core.exceptions import AppException

class QuotationService:
    def calculate_final_amount(self, base_price: float, additional_charges: float, discount: float) -> float:
        """Final Amount = Base Price + Additional Charges - Discount."""
        final = base_price + additional_charges - discount
        return max(0.0, round(final, 2))

    def convert_quotation_to_order(
        self,
        db: Session,
        quotation: Quotation,
        admin_user_id: Optional[str] = None
    ) -> Order:
        """
        Converts an accepted quotation into an active Order and updates the custom request.
        """
        if quotation.status != QuotationStatus.ACCEPTED:
            raise AppException(status_code=400, message="Only ACCEPTED quotations can be converted to an order.")

        req: CustomRequest = quotation.custom_request
        order_number = order_service.generate_order_number(db)

        remaining = quotation.final_amount - quotation.advance_amount

        order = Order(
            order_number=order_number,
            customer_id=quotation.customer_id,
            design_id=req.design_id,
            measurement_profile_id=req.measurement_profile_id,
            custom_request_id=req.id,
            price=quotation.final_amount,
            advance_amount=quotation.advance_amount,
            remaining_amount=remaining,
            expected_delivery_date=req.required_date,
            status=OrderStatus.ORDER_RECEIVED,
            notes=f"Custom Request: {req.garment_type} ({req.fabric or 'Standard fabric'}). {req.description}"
        )
        db.add(order)
        db.flush()

        # Update custom request status
        req.status = CustomRequestStatus.CONVERTED_TO_ORDER

        # Log initial order status
        order_service.update_order_status(
            db=db,
            order=order,
            new_status=OrderStatus.ORDER_RECEIVED,
            notes="Order created from accepted custom quotation.",
            changed_by_user_id=admin_user_id
        )

        return order

quotation_service = QuotationService()
