import authRoutes from "./src/modules/auth/auth.routes.js";
import { mount } from "./src/docs/swagger/routeRegistry.js";
import rolesRoutes from "./src/modules/settings/roles/roles.routes.js";
import permissionsRoutes from "./src/modules/settings/permissions/permissions.routes.js";
import cmsPagesRoutes from "./src/modules/cms/cmspage/cmspage.routes.js";
import cmsPageSectionsRoutes from "./src/modules/cms/cmspagesections/cmspagesections.routes.js";
import locationRoutes from "./src/modules/location/location.routes.js";
import countryPageRoutes from "./src/modules/country/countryPage/countryPage.routes.js";
import countryPageSectionsRoutes from "./src/modules/country/countryPageSection/countryPageSection.routes.js";
export const bootstraps = (app: any) => {
  mount(app, "/api/v1/auth", authRoutes);
  mount(app, "/api/v1/roles", rolesRoutes);
  mount(app, "/api/v1/permissions", permissionsRoutes);
  mount(app, "/api/v1/cmspages", cmsPagesRoutes);
  mount(app, "/api/v1/cmspagesections", cmsPageSectionsRoutes);
  mount(app, "/api/v1/locations", locationRoutes);
  mount(app, "/api/v1/country-pages", countryPageRoutes);
  mount(app, "/api/v1/country-pages-sections", countryPageSectionsRoutes);
};