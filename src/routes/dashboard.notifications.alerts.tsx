import { createFileRoute } from '@tanstack/react-router';
import { useAlertStore, alertStore, AlertSeverity, Alert } from '@/lib/alert-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Megaphone, Trash2, Send, Palette, BellRing, Eye, Edit2, Play, Pause, Save, TestTube, AlertTriangle, Info, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/notifications/alerts')({
  component: AlertsManagementPage,
});

function AlertsManagementPage() {
  const { alerts } = useAlertStore();
  const [isDrafting, setIsDrafting] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('Info');
  const [targetUser, setTargetUser] = useState('All Users');
  const [colorOverride, setColorOverride] = useState('');

  const resetForm = () => {
    setIsDrafting(false);
    setEditingId(null);
    setTitle('');
    setMessage('');
    setSeverity('Info');
    setColorOverride('');
    setTargetUser('All Users');
  };

  const handleEdit = (alert: Alert) => {
    setEditingId(alert.id);
    setTitle(alert.title);
    setMessage(alert.message);
    setSeverity(alert.severity);
    setTargetUser(alert.targetUser);
    setColorOverride(alert.colorOverride || '');
    setIsDrafting(true);
  };

  const handleSave = (publishMode: boolean = true) => {
    if (editingId) {
      alertStore.updateAlert(editingId, {
        title,
        message,
        severity,
        targetUser,
        colorOverride: colorOverride || undefined,
        ...(publishMode ? {} : { status: 'Draft' }),
      });
    } else {
      alertStore.addAlert({
        title,
        message,
        severity,
        targetUser,
        status: publishMode ? 'Published' : 'Draft',
        colorOverride: colorOverride || undefined,
      });
    }
    resetForm();
  };

  const handleTestPreview = () => {
    if (!title || !message) return;
    setPreviewModalOpen(true);
  };

  const togglePublishStatus = (alert: Alert) => {
    alertStore.updateAlert(alert.id, {
      status: alert.status === 'Published' ? 'Draft' : 'Published'
    });
  };

  const getPreviewSeverityStyles = () => {
    if (colorOverride) {
      return {
        bg: colorOverride,
        border: colorOverride,
        text: 'text-white',
        icon: <Info className="size-6 text-white" />
      };
    }

    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-red-600 dark:bg-red-900',
          border: 'border-red-500',
          text: 'text-white',
          icon: <ShieldAlert className="size-6 text-white animate-pulse" />
        };
      case 'High':
        return {
          bg: 'bg-orange-500 dark:bg-orange-800',
          border: 'border-orange-400',
          text: 'text-white',
          icon: <AlertTriangle className="size-6 text-white" />
        };
      case 'Medium':
        return {
          bg: 'bg-amber-400 dark:bg-amber-600',
          border: 'border-amber-500',
          text: 'text-black dark:text-white',
          icon: <AlertTriangle className="size-6" />
        };
      case 'Info':
      default:
        return {
          bg: 'bg-blue-500 dark:bg-blue-800',
          border: 'border-blue-400',
          text: 'text-white',
          icon: <Info className="size-6 text-white" />
        };
    }
  };

  const previewStyles = getPreviewSeverityStyles();

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Alert Command Center</h1>
          <p className="text-muted-foreground mt-1 text-sm">Broadcast high-priority alerts and personalized notifications directly to user screens.</p>
        </div>
        <button 
          onClick={() => {
            if (isDrafting) resetForm();
            else setIsDrafting(true);
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          {isDrafting ? 'Cancel' : <><Megaphone className="size-4 shrink-0" /> New Broadcast</>}
        </button>
      </div>

      {isDrafting && (
        <Card className="border-border shadow-lg animate-in slide-in-from-top-4 fade-in duration-300 ring-2 ring-primary">
          <CardHeader className="bg-muted/30 border-b border-border flex flex-row items-center justify-between py-4">
            <CardTitle className="flex items-center gap-2 text-primary">
              <BellRing className="size-5" /> {editingId ? 'Edit Alert' : 'Compose Alert'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleTestPreview}
                disabled={!title || !message}
                className="bg-purple-600/10 text-purple-600 px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 hover:bg-purple-600/20 disabled:opacity-50 transition-colors border border-purple-600/20 text-sm"
              >
                <TestTube className="size-4" /> Test Preview
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Alert Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="e.g. EXCO Meeting Postponed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Message Body</label>
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full p-3 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]" 
                    placeholder="Type the exact message to be displayed to the user(s)..."
                  />
                </div>
              </div>

              <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Target Audience</label>
                  <select 
                    value={targetUser}
                    onChange={e => setTargetUser(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md text-sm"
                  >
                    <option>All Users</option>
                    <option>Executive Room (Gov, DGov, SSG, COS)</option>
                    <option>All Commissioners</option>
                    <option>All Permanent Secretaries</option>
                    <option>Specific MDA</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Severity Level</label>
                  <div className="flex gap-2">
                    {['Info', 'Medium', 'High', 'Critical'].map(level => (
                      <button 
                        key={level}
                        onClick={() => setSeverity(level as AlertSeverity)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                          severity === level 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-background hover:bg-muted border-border'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="size-4 text-muted-foreground" /> Personalize Color (Optional)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={colorOverride || '#3b82f6'}
                      onChange={e => setColorOverride(e.target.value)}
                      className="h-8 w-14 p-0 cursor-pointer border-0 bg-transparent rounded"
                    />
                    <span className="text-xs text-muted-foreground">Override severity colors with a custom hex</span>
                    {colorOverride && (
                      <button onClick={() => setColorOverride('')} className="text-xs text-destructive hover:underline ml-auto">Clear</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="size-4" /> Clicking broadcast will immediately display this alert globally.
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleSave(false)}
                  disabled={!title || !message}
                  className="w-full md:w-auto bg-muted text-foreground border border-border px-6 py-2 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-muted/80 disabled:opacity-50 transition-colors"
                >
                  <Save className="size-4" /> Save as Draft
                </button>
                <button 
                  onClick={() => handleSave(true)}
                  disabled={!title || !message}
                  className="w-full md:w-auto bg-red-600 text-white px-6 py-2 rounded-md font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Send className="size-4" /> {editingId ? 'Update & Broadcast' : 'Broadcast Now'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle>Broadcast History & Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No alerts in history.
                  </td>
                </tr>
              )}
              {alerts.map(alert => (
                <tr key={alert.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      alert.status === 'Published' 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {alert.status === 'Published' && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {alert.title}
                    <div className="text-xs font-normal text-muted-foreground truncate max-w-[300px] mt-0.5">{alert.message}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold border border-border bg-background px-2 py-1 rounded-md">
                      {alert.colorOverride ? (
                        <span className="flex items-center gap-1"><div className="size-2 rounded-full" style={{backgroundColor: alert.colorOverride}} /> Custom</span>
                      ) : alert.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{alert.targetUser}</td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button 
                      title={alert.status === 'Published' ? "Stop Publishing (Unpublish)" : "Republish Alert"}
                      onClick={() => togglePublishStatus(alert)} 
                      className={`p-1.5 transition-colors rounded border ${
                        alert.status === 'Published' 
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      {alert.status === 'Published' ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </button>
                    <button 
                      title="Edit Alert"
                      onClick={() => handleEdit(alert)} 
                      className="p-1.5 text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors rounded"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button 
                      title="Delete Alert"
                      onClick={() => alertStore.deleteAlert(alert.id)} 
                      className="p-1.5 text-red-600 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors rounded"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {previewModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div 
            className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border-2 animate-in zoom-in-95 duration-300 ${previewStyles.border}`}
            style={colorOverride ? { backgroundColor: colorOverride, borderColor: colorOverride } : {}}
          >
            {!colorOverride && (
              <div className={`${previewStyles.bg} p-4 flex items-center justify-between gap-3`}>
                <div className="flex items-center gap-3">
                  {previewStyles.icon}
                  <h2 className={`text-xl font-bold ${previewStyles.text}`}>
                    [TEST PREVIEW] {title}
                  </h2>
                </div>
                <button onClick={() => setPreviewModalOpen(false)} className={`p-1 rounded-md hover:bg-black/20 ${previewStyles.text}`}>
                  <X className="size-5" />
                </button>
              </div>
            )}
            {colorOverride && (
              <div className="p-4 flex items-center justify-between gap-3 bg-black/10">
                <div className="flex items-center gap-3">
                  {previewStyles.icon}
                  <h2 className={`text-xl font-bold ${previewStyles.text}`}>
                    [TEST PREVIEW] {title}
                  </h2>
                </div>
                <button onClick={() => setPreviewModalOpen(false)} className={`p-1 rounded-md hover:bg-black/20 ${previewStyles.text}`}>
                  <X className="size-5" />
                </button>
              </div>
            )}
            <div className={`p-6 ${colorOverride ? previewStyles.text : 'bg-background text-foreground'}`}>
              <p className="text-lg leading-relaxed">{message}</p>
              
              <div className="mt-8 flex items-center justify-between">
                <span className={`text-xs opacity-70 ${colorOverride ? previewStyles.text : 'text-muted-foreground'}`}>
                  Sent to: {targetUser}
                </span>
                <button 
                  onClick={() => setPreviewModalOpen(false)}
                  className={`px-6 py-2 font-bold rounded-lg transition-transform hover:scale-105 ${
                    colorOverride 
                      ? 'bg-black/20 text-white hover:bg-black/30' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
