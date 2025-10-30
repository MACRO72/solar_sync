
import { UserProfileForm } from './components/user-profile-form';
import { NotificationSettings } from './components/notification-settings';
import { AppInformation } from './components/app-information';
import { HelpAndSupport } from './components/help-support';

export default function SettingsPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
            <UserProfileForm />
            <AppInformation />
        </div>
        <div className="space-y-6">
            <NotificationSettings />
            <HelpAndSupport />
        </div>
    </div>
  );
}
