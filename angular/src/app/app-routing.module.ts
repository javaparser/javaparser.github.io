import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { Shell } from '@app/shell/services/shell.service';

const routes: Routes = [
  Shell.childRoutes([
    { path: 'about', loadChildren: './pages/about/about.module#AboutModule' },
    { path: 'app-landing', loadChildren: './pages/app-landing/app-landing.module#AppLandingModule' },
    { path: 'automate-social', loadChildren: './pages/automate-social/automate-social.module#AutomateSocialModule' },
    {
      path: 'business-solutions',
      loadChildren: './pages/business-solutions/business-solutions.module#BusinessSolutionsModule'
    },
    { path: 'contact', loadChildren: './pages/contact/contact.module#ContactModule' },
    { path: 'corporate', loadChildren: './pages/corporate/corporate.module#CorporateModule' },
    { path: 'developers', loadChildren: './pages/developers/developers.module#DevelopersModule' },
    { path: 'faqs', loadChildren: './pages/faqs/faqs.module#FaqsModule' },
    { path: 'online-payment', loadChildren: './pages/online-payment/online-payment.module#OnlinePaymentModule' },
    { path: 'pricing', loadChildren: './pages/pricing/pricing.module#PricingModule' },
    { path: 'saas', loadChildren: './pages/saas/saas.module#SaasModule' },
    { path: 'startup', loadChildren: './pages/startup/startup.module#StartupModule' }
  ]),

  { path: 'app-landing-2', loadChildren: './pages/app-landing-2/app-landing-2.module#AppLanding2Module' },
  { path: 'auth', loadChildren: './pages/auth/auth.module#AuthModule' },
  { path: 'integration', loadChildren: './pages/integration/integration.module#IntegrationModule' },
  { path: 'smart-business', loadChildren: './pages/smart-business/smart-business.module#SmartBusinessModule' },
  { path: 'terms', loadChildren: './pages/terms/terms.module#TermsModule' },
  { path: 'social', loadChildren: './pages/social/social.module#SocialModule' },

  // Fallback when no prior route is matched
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
