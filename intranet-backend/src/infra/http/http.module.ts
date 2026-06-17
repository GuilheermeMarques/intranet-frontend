import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { PermissionsGuard } from '../auth/permissions.guard'
import { HealthController } from './controllers/health.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { LogoutController } from './controllers/logout.controller'
import { GetMeController } from './controllers/get-me.controller'
import { ListUsersController } from './controllers/list-users.controller'
import { GetUserPermissionsController } from './controllers/get-user-permissions.controller'
import { SetUserPermissionsController } from './controllers/set-user-permissions.controller'
import { GetPermissionsCatalogController } from './controllers/get-permissions-catalog.controller'
import { PreferencesController } from './controllers/preferences.controller'
import { FetchClientsController } from './controllers/fetch-clients.controller'
import { GetClientLookupsController } from './controllers/get-client-lookups.controller'
import { GetClientByCodeController } from './controllers/get-client-by-code.controller'
import { CreateClientController } from './controllers/create-client.controller'
import { GetClientByIdController } from './controllers/get-client-by-id.controller'
import { EditClientController } from './controllers/edit-client.controller'
import { DeleteClientController } from './controllers/delete-client.controller'
import { FetchProductsController } from './controllers/fetch-products.controller'
import { GetProductLookupsController } from './controllers/get-product-lookups.controller'
import { CreateProductController } from './controllers/create-product.controller'
import { GetProductByIdController } from './controllers/get-product-by-id.controller'
import { EditProductController } from './controllers/edit-product.controller'
import { DeleteProductController } from './controllers/delete-product.controller'
import { FetchInventoryMovementsController } from './controllers/fetch-inventory-movements.controller'
import { CreateInventoryMovementController } from './controllers/create-inventory-movement.controller'
import { GetInventoryLookupsController } from './controllers/get-inventory-lookups.controller'
import { FetchRepresentativesController } from './controllers/fetch-representatives.controller'
import { FetchOrdersController } from './controllers/fetch-orders.controller'
import { GetOrderByIdController } from './controllers/get-order-by-id.controller'
import { CreateOrderController } from './controllers/create-order.controller'
import { EditOrderController } from './controllers/edit-order.controller'
import { ChangeOrderStatusController } from './controllers/change-order-status.controller'
import { FetchBudgetsController } from './controllers/fetch-budgets.controller'
import { GetBudgetByIdController } from './controllers/get-budget-by-id.controller'
import { CreateBudgetController } from './controllers/create-budget.controller'
import { EditBudgetController } from './controllers/edit-budget.controller'
import { DeleteBudgetController } from './controllers/delete-budget.controller'
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'
import { RefreshTokenUseCase } from '@/domain/iam/application/use-cases/refresh-token'
import { LogoutUseCase } from '@/domain/iam/application/use-cases/logout'
import { GetMeUseCase } from '@/domain/iam/application/use-cases/get-me'
import { ListUsersUseCase } from '@/domain/iam/application/use-cases/list-users'
import { GetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/get-user-permissions'
import { SetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/set-user-permissions'
import { GetPermissionsCatalogUseCase } from '@/domain/iam/application/use-cases/get-permissions-catalog'
import { GetPreferencesUseCase } from '@/domain/iam/application/use-cases/get-preferences'
import { UpdatePreferencesUseCase } from '@/domain/iam/application/use-cases/update-preferences'
import { FetchClientsUseCase } from '@/domain/sales/application/use-cases/fetch-clients'
import { FetchCitiesUseCase } from '@/domain/sales/application/use-cases/fetch-cities'
import { GetClientByCodeUseCase } from '@/domain/sales/application/use-cases/get-client-by-code'
import { CreateClientUseCase } from '@/domain/sales/application/use-cases/create-client'
import { GetClientByIdUseCase } from '@/domain/sales/application/use-cases/get-client-by-id'
import { EditClientUseCase } from '@/domain/sales/application/use-cases/edit-client'
import { DeleteClientUseCase } from '@/domain/sales/application/use-cases/delete-client'
import { FetchProductsUseCase } from '@/domain/sales/application/use-cases/fetch-products'
import { FetchProductLookupsUseCase } from '@/domain/sales/application/use-cases/fetch-product-lookups'
import { CreateProductUseCase } from '@/domain/sales/application/use-cases/create-product'
import { GetProductByIdUseCase } from '@/domain/sales/application/use-cases/get-product-by-id'
import { EditProductUseCase } from '@/domain/sales/application/use-cases/edit-product'
import { DeleteProductUseCase } from '@/domain/sales/application/use-cases/delete-product'
import { FetchInventoryMovementsUseCase } from '@/domain/sales/application/use-cases/fetch-inventory-movements'
import { CreateInventoryMovementUseCase } from '@/domain/sales/application/use-cases/create-inventory-movement'
import { FetchInventoryLookupsUseCase } from '@/domain/sales/application/use-cases/fetch-inventory-lookups'
import { FetchRepresentativesUseCase } from '@/domain/sales/application/use-cases/fetch-representatives'
import { FetchOrdersUseCase } from '@/domain/sales/application/use-cases/fetch-orders'
import { GetOrderByIdUseCase } from '@/domain/sales/application/use-cases/get-order-by-id'
import { CreateOrderUseCase } from '@/domain/sales/application/use-cases/create-order'
import { EditOrderUseCase } from '@/domain/sales/application/use-cases/edit-order'
import { ChangeOrderStatusUseCase } from '@/domain/sales/application/use-cases/change-order-status'
import { FetchBudgetsUseCase } from '@/domain/sales/application/use-cases/fetch-budgets'
import { GetBudgetByIdUseCase } from '@/domain/sales/application/use-cases/get-budget-by-id'
import { CreateBudgetUseCase } from '@/domain/sales/application/use-cases/create-budget'
import { EditBudgetUseCase } from '@/domain/sales/application/use-cases/edit-budget'
import { DeleteBudgetUseCase } from '@/domain/sales/application/use-cases/delete-budget'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    HealthController,
    AuthenticateController,
    RefreshTokenController,
    LogoutController,
    GetMeController,
    ListUsersController,
    GetUserPermissionsController,
    SetUserPermissionsController,
    GetPermissionsCatalogController,
    PreferencesController,
    FetchClientsController,
    GetClientLookupsController,
    GetClientByCodeController,
    CreateClientController,
    GetClientByIdController,
    EditClientController,
    DeleteClientController,
    FetchProductsController,
    GetProductLookupsController,
    CreateProductController,
    GetProductByIdController,
    EditProductController,
    DeleteProductController,
    GetInventoryLookupsController,
    FetchInventoryMovementsController,
    CreateInventoryMovementController,
    FetchRepresentativesController,
    FetchOrdersController,
    GetOrderByIdController,
    CreateOrderController,
    EditOrderController,
    ChangeOrderStatusController,
    FetchBudgetsController,
    GetBudgetByIdController,
    CreateBudgetController,
    EditBudgetController,
    DeleteBudgetController,
  ],
  providers: [
    AuthenticateUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    ListUsersUseCase,
    GetUserPermissionsUseCase,
    SetUserPermissionsUseCase,
    GetPermissionsCatalogUseCase,
    GetPreferencesUseCase,
    UpdatePreferencesUseCase,
    FetchClientsUseCase,
    FetchCitiesUseCase,
    GetClientByCodeUseCase,
    CreateClientUseCase,
    GetClientByIdUseCase,
    EditClientUseCase,
    DeleteClientUseCase,
    FetchProductsUseCase,
    FetchProductLookupsUseCase,
    CreateProductUseCase,
    GetProductByIdUseCase,
    EditProductUseCase,
    DeleteProductUseCase,
    FetchInventoryMovementsUseCase,
    CreateInventoryMovementUseCase,
    FetchInventoryLookupsUseCase,
    FetchRepresentativesUseCase,
    FetchOrdersUseCase,
    GetOrderByIdUseCase,
    CreateOrderUseCase,
    EditOrderUseCase,
    ChangeOrderStatusUseCase,
    FetchBudgetsUseCase,
    GetBudgetByIdUseCase,
    CreateBudgetUseCase,
    EditBudgetUseCase,
    DeleteBudgetUseCase,
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class HttpModule {}
