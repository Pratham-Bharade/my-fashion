from app.schemas.common import (
    BaseSchema,
    ApiResponse,
    PaginatedResponse,
    MessageResponse
)
from app.schemas.auth import (
    Token,
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest
)
from app.schemas.user import (
    UserRead,
    UserCreate,
    UserUpdate,
    CustomerAdminRead,
    CustomerProfileRead,
    CustomerProfileCreate,
    CustomerProfileUpdate
)
from app.schemas.service import (
    ServiceRead,
    ServiceCreate,
    ServiceUpdate
)
from app.schemas.design import (
    DesignRead,
    DesignCreate,
    DesignUpdate
)
from app.schemas.measurement import (
    MeasurementProfileRead,
    MeasurementProfileCreate,
    MeasurementProfileUpdate
)
from app.schemas.appointment import (
    AppointmentRead,
    AppointmentCreate,
    AppointmentStatusUpdate,
    AppointmentReschedule,
    AvailableSlot
)
from app.schemas.custom_request import (
    CustomRequestRead,
    CustomRequestCreate,
    CustomRequestStatusUpdate,
    CustomRequestImageRead
)
from app.schemas.quotation import (
    QuotationRead,
    QuotationCreate,
    QuotationRespond
)
from app.schemas.order import (
    OrderRead,
    OrderCreate,
    OrderStatusUpdate,
    OrderStatusHistoryRead
)
from app.schemas.payment import (
    PaymentRead,
    PaymentCreate
)
from app.schemas.review import (
    ReviewRead,
    ReviewCreate,
    ReviewStatusUpdate
)
from app.schemas.notification import (
    NotificationRead,
    NotificationCreate
)
from app.schemas.contact import (
    ContactMessageRead,
    ContactMessageCreate,
    ContactMessageStatusUpdate
)
from app.schemas.settings import (
    BusinessSettingsRead,
    BusinessSettingsUpdate
)
from app.schemas.dashboard import (
    AdminDashboardStats,
    DashboardAnalytics,
    MonthlyRevenue,
    CategoryStat,
    StatusCount
)
