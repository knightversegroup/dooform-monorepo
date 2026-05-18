import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './AppShell';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RequirePermission } from '../components/auth/RequirePermission';
import TemplatesPage from '../pages/TemplatesPage';
import TemplateUploadPage from '../pages/TemplateUploadPage';
import TemplateGroupPage from '../pages/TemplateGroupPage';
import FormDetailPage from '../pages/FormDetailPage';
import FormFillPage from '../pages/FormFillPage';
import TemplateFieldsPage from '../pages/TemplateFieldsPage';
import DocumentsPage from '../pages/DocumentsPage';
import DocumentDetailPage from '../pages/DocumentDetailPage';
import PdfEditorPage from '../pages/PdfEditorPage';
import WatermarksPage from '../pages/WatermarksPage';
import InboxPage from '../pages/InboxPage';
import SettingsDataTypesPage from '../pages/SettingsDataTypesPage';
import DictionaryAdminPage from '../pages/DictionaryAdminPage';
import ProfileSettingsPage from '../pages/settings/ProfileSettingsPage';
import OrganizationSettingsPage from '../pages/settings/OrganizationSettingsPage';
import PermissionsSettingsPage from '../pages/settings/PermissionsSettingsPage';
import UsersSettingsPage from '../pages/settings/UsersSettingsPage';
import TenantsAdminPage from '../pages/settings/TenantsAdminPage';
import AuditLogPage from '../pages/settings/AuditLogPage';
import CompliancePage from '../pages/settings/CompliancePage';
import TaxonomyAdminPage from '../pages/settings/TaxonomyAdminPage';
import TiersAdminPage from '../pages/settings/TiersAdminPage';
import AnnouncementsAdminPage from '../pages/settings/AnnouncementsAdminPage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import OnboardingPage from '../pages/auth/OnboardingPage';

export const router = createBrowserRouter([
  {
    path: '/auth',
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/templates" replace /> },
      { path: '/templates', element: <TemplatesPage /> },
      {
        path: '/templates/new',
        element: (
          <RequirePermission anyOf={['templates:create']}>
            <TemplateUploadPage />
          </RequirePermission>
        ),
      },
      { path: '/templates/group/:documentTypeId', element: <TemplateGroupPage /> },
      { path: '/templates/:templateId', element: <FormDetailPage /> },
      {
        path: '/templates/:templateId/fields',
        element: (
          <RequirePermission anyOf={['templates:update']}>
            <TemplateFieldsPage />
          </RequirePermission>
        ),
      },
      { path: '/templates/:templateId/fill', element: <FormFillPage /> },
      { path: '/documents', element: <DocumentsPage /> },
      { path: '/documents/:documentId', element: <DocumentDetailPage /> },
      {
        path: '/documents/:documentId/edit',
        element: (
          <RequirePermission anyOf={['documents:update', 'documents:sign']}>
            <PdfEditorPage />
          </RequirePermission>
        ),
      },
      // Legacy /history* routes redirect for back-compat
      { path: '/history', element: <Navigate to="/documents" replace /> },
      { path: '/history/:documentId', element: <Navigate to="/documents/:documentId" replace /> },
      { path: '/inbox', element: <InboxPage /> },
      { path: '/watermarks', element: <WatermarksPage /> },
      { path: '/settings/profile', element: <ProfileSettingsPage /> },
      { path: '/settings/organization', element: <OrganizationSettingsPage /> },
      {
        path: '/settings/permissions',
        element: (
          <RequirePermission anyOf={['platform:permissions:manage']}>
            <PermissionsSettingsPage />
          </RequirePermission>
        ),
      },
      {
        path: '/settings/users',
        element: (
          <RequirePermission anyOf={['users:override-permissions', 'users:assign-role']}>
            <UsersSettingsPage />
          </RequirePermission>
        ),
      },
      {
        path: '/settings/tenants',
        element: (
          <RequirePermission anyOf={['platform:tenants:manage']}>
            <TenantsAdminPage />
          </RequirePermission>
        ),
      },
      {
        path: '/settings/audit-log',
        element: (
          <RequirePermission anyOf={['organization:audit:read']}>
            <AuditLogPage />
          </RequirePermission>
        ),
      },
      {
        path: '/settings/compliance',
        element: (
          <RequirePermission anyOf={['organization:audit:read']}>
            <CompliancePage />
          </RequirePermission>
        ),
      },
      {
        path: '/settings/taxonomy',
        element: (
          <RequirePermission anyOf={['platform:taxonomy:manage']}>
            <TaxonomyAdminPage />
          </RequirePermission>
        ),
      },
      {
        path: '/settings/tiers',
        element: (
          <RequirePermission anyOf={['platform:tiers:manage']}>
            <TiersAdminPage />
          </RequirePermission>
        ),
      },
      { path: '/settings/field-types', element: <SettingsDataTypesPage /> },
      {
        path: '/settings/announcements',
        element: (
          <RequirePermission anyOf={['announcements:manage']}>
            <AnnouncementsAdminPage />
          </RequirePermission>
        ),
      },
      {
        path: '/dictionary',
        element: (
          <RequirePermission anyOf={['dictionary:read']}>
            <DictionaryAdminPage />
          </RequirePermission>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
