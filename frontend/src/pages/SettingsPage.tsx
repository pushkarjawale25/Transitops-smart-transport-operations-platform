import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import {
  User, Bell, Mail, FileText, Upload, CheckCircle, AlertTriangle,
  Info, XCircle, CheckCircle2, Clock, Shield, BellRing, Fuel,
} from 'lucide-react';
import { formatDate, formatDateTime, daysUntil } from '@/utils/format';
import { cn } from '@/lib/utils';

export function SettingsPage() {
  const { user } = useAuth();
  const { drivers, notifications, activities, markNotificationRead, markAllRead, fuelPrices, updateFuelPrices } = useData();
  const [emailReminder, setEmailReminder] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [reminderDays, setReminderDays] = useState(30);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string; date: string }[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  const expiringDrivers = drivers.filter((d) => daysUntil(d.licenseExpiry) <= 60);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles = files.map((f) => ({ name: f.name, type: f.type || 'document', date: new Date().toISOString() }));
    setUploadedFiles((prev) => [...newFiles, ...prev]);
  };

  const sendReminderEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const notifIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, notifications, and documents." />

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-2xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge className="mt-1 bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-transparent">{user?.role}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5"><Label>Full Name</Label><Input defaultValue={user?.name} /></div>
                <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user?.email} type="email" /></div>
                <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+91 98xxxxxxx" /></div>
                <div className="space-y-1.5"><Label>Department</Label><Input placeholder="Operations" /></div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Email Reminders</p><p className="text-xs text-muted-foreground">License expiry & maintenance alerts</p></div>
                  <Switch checked={emailReminder} onCheckedChange={setEmailReminder} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Push Notifications</p><p className="text-xs text-muted-foreground">Real-time in-app alerts</p></div>
                  <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Weekly Report</p><p className="text-xs text-muted-foreground">Summary email every Monday</p></div>
                  <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
                </div>
                <div className="space-y-1.5 pt-2"><Label>Reminder Threshold (days before expiry)</Label><Input type="number" value={reminderDays} onChange={(e) => setReminderDays(+e.target.value)} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Fuel className="h-5 w-5" /> Pune Fuel Prices</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 max-w-lg">
                <div className="space-y-1.5"><Label>City</Label><Input value={fuelPrices.city} readOnly /></div>
                <div className="space-y-1.5"><Label>Diesel Price (₹/L)</Label><Input type="number" value={fuelPrices.diesel} onChange={(e) => updateFuelPrices({ diesel: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label>Petrol Price (₹/L)</Label><Input type="number" value={fuelPrices.petrol} onChange={(e) => updateFuelPrices({ petrol: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label>CNG Price (₹/kg)</Label><Input type="number" value={fuelPrices.cng} onChange={(e) => updateFuelPrices({ cng: Number(e.target.value) })} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><BellRing className="h-5 w-5" /> Notification Center</CardTitle>
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.map((n) => (
                    <button key={n.id} onClick={() => markNotificationRead(n.id)} className={cn('w-full flex items-start gap-3 rounded-lg p-3 text-left border hover:bg-muted/40 transition-colors', !n.read && 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20')}>
                      <div className="mt-0.5">{notifIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(n.date)}</p>
                      </div>
                      {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* License Expiry Notifications */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> License Expiry Notifications</CardTitle><CardDescription>Drivers with licenses expiring within 60 days</CardDescription></CardHeader>
              <CardContent>
                {expiringDrivers.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" /> All driver licenses are valid for the next 60 days.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {expiringDrivers.map((d) => {
                      const days = daysUntil(d.licenseExpiry);
                      const expired = days < 0;
                      return (
                        <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-semibold',
                              expired ? 'bg-red-500' : days <= 30 ? 'bg-amber-500' : 'bg-blue-500')}>
                              {d.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{d.name}</p>
                              <p className="text-xs text-muted-foreground">{d.licenseNumber} · {d.licenseCategory}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-xs px-2 py-1 rounded-md font-medium',
                              expired ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400')}>
                              {expired ? 'Expired' : `${days} days left`}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(d.licenseExpiry)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-3 pt-2">
                      <Button size="sm" onClick={sendReminderEmail} className="h-8">
                        <Mail className="h-3.5 w-3.5 mr-1.5" /> Send Reminder Email
                      </Button>
                      {emailSent && (
                        <span className="flex items-center gap-1 text-sm text-emerald-600 animate-fade-in">
                          <CheckCircle2 className="h-4 w-4" /> Reminder sent to {expiringDrivers.length} driver(s)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Vehicle Document Upload</CardTitle><CardDescription>Upload registration, insurance, and inspection documents</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border-2 border-dashed p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Drag and drop files here, or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
                <label className="mt-4 inline-block">
                  <input type="file" multiple className="hidden" onChange={handleUpload} />
                  <span className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors">Browse Files</span>
                </label>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Documents</p>
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/15"><FileText className="h-4 w-4 text-blue-600" /></div>
                        <div><p className="text-sm font-medium">{f.name}</p><p className="text-xs text-muted-foreground">{formatDateTime(f.date)}</p></div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Timeline */}
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Activity Timeline</CardTitle><CardDescription>Recent actions across the platform</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((a, i) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15 text-xs font-semibold text-blue-600 shrink-0">
                        {a.user.charAt(0)}
                      </div>
                      {i < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-medium">{a.action}</p>
                      <p className="text-xs text-muted-foreground">{a.detail}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{a.user} · {formatDateTime(a.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
