import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  project: {
    title: string;
  } | null;
}

const DashboardInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("invoices")
        .select(`
          id,
          amount,
          status,
          due_date,
          paid_at,
          created_at,
          project:projects(title)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setInvoices(data as Invoice[]);
      }
      setLoading(false);
    };

    fetchInvoices();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "overdue":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Invoices">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Invoices</h1>
        <p className="text-muted-foreground">Your billing history</p>
      </div>

      {invoices.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">No invoices yet</h2>
          <p className="text-muted-foreground">Invoices for your projects will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {invoice.project?.title || "General Invoice"}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(invoice.created_at), "MMM d, yyyy")}
                    </span>
                    {invoice.due_date && (
                      <span>Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  {invoice.paid_at && (
                    <p className="text-xs text-green-400 mt-1">
                      Paid on {format(new Date(invoice.paid_at), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="font-display text-2xl font-bold text-foreground">
                    {invoice.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardInvoices;
