import authRoutes from "./src/modules/auth/auth.routes.js";
import { mount } from "./src/docs/swagger/routeRegistry.js";
import rolesRoutes from "./src/modules/settings/roles/roles.routes.js";
import permissionsRoutes from "./src/modules/settings/permissions/permissions.routes.js";
import fileUploadRoutes from "./src/modules/fileUpload/fileUpload.routes.js";
import cmsPagesRoutes from "./src/modules/cms/cmspage/cmspage.routes.js";
import locationRoutes from "./src/modules/location/location.routes.js";
import journeyRoutes from "./src/modules/journey/Journey/journey.routes.js";
import bookingRoutes from "./src/modules/booking/booking/booking.routes.js";
import paymentScheduleRoutes from "./src/modules/booking/paymentSchedule/paymentSchedule.routes.js";
import paymentRecordRoutes from "./src/modules/booking/paymentRecord/paymentRecord.routes.js";
import paymentConfigRoutes from "./src/modules/booking/paymentConfig/paymentConfig.routes.js";
import storyRoutes from "./src/modules/story/story.routes.js";
import storyCategoryRoutes from "./src/modules/storyCategory/storyCategory.routes.js";
import storyTypeRoutes from "./src/modules/storyType/storyType.routes.js";
import userRoutes from "./src/modules/users/users.routes.js";
import statisticsRoutes from "./src/modules/statistics/statistics.routes.js";
import systemRoutes from "./src/modules/system/system.routes.js";
import auditRoutes from "./src/modules/audit/audit.routes.js";
import paymentsRoutes from "./src/modules/payments/payments.routes.js";
import conciergeRoutes from "./src/modules/concierge/concierge.routes.js";
import settingsRoutes from "./src/modules/settings/settings.routes.js";
import wishlistRoutes from "./src/modules/wishlist/wishlist.routes.js";
import journeyWizardRoutes from "./src/modules/journeyWizard/journeyWizard.routes.js";
import newsletterRoutes from "./src/modules/newsletter/newsletter.routes.js";

export const bootStapHttps = (app: any) => {
  mount(app, "/api/v1/audit", auditRoutes);
  mount(app, "/api/v1/system", systemRoutes);
  mount(app, "/api/v1/auth", authRoutes);
  mount(app, "/api/v1/users", userRoutes);
  mount(app, "/api/v1/statistics", statisticsRoutes);
  mount(app, "/api/v1/dashboard/statastics", statisticsRoutes);
  mount(app, "/api/v1/roles", rolesRoutes);
  mount(app, "/api/v1/permissions", permissionsRoutes);
  mount(app, "/api/v1/file-upload", fileUploadRoutes);
  mount(app, "/api/v1/cms-pages", cmsPagesRoutes);
  mount(app, "/api/v1/locations", locationRoutes);
  mount(app, "/api/v1/journeys", journeyRoutes);
  mount(app, "/api/v1/wishlist", wishlistRoutes);
  
  mount(app, "/api/v1/bookings", bookingRoutes);
  mount(app, "/api/v1/payment-schedules", paymentScheduleRoutes);
  mount(app, "/api/v1/payment-records", paymentRecordRoutes);
  mount(app, "/api/v1/payment-config", paymentConfigRoutes);
  mount(app, "/api/v1/stories", storyRoutes);
  mount(app, "/api/v1/story-categories", storyCategoryRoutes);
  mount(app, "/api/v1/story-types", storyTypeRoutes);
  mount(app, "/api/v1/payments", paymentsRoutes);
  mount(app, "/api/v1/concierge/leads", conciergeRoutes);
  mount(app, "/api/v1/journey-wizard", journeyWizardRoutes);
  mount(app, "/api/v1/settings", settingsRoutes);
  mount(app, "/api/v1/newsletter", newsletterRoutes);
};

export const bootstraps = bootStapHttps;

