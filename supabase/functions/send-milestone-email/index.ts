import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000];

interface MilestoneCheckRequest {
  websiteId: string;
  hostname: string;
  email: string;
  currentVisitors: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteId, hostname, email, currentVisitors }: MilestoneCheckRequest = await req.json();
    
    console.log(`Checking milestones for ${hostname}: ${currentVisitors} visitors`);

    if (!email) {
      console.log("No email configured for notifications");
      return new Response(JSON.stringify({ message: "No email configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find which milestones have been reached
    const reachedMilestones = MILESTONES.filter(m => currentVisitors >= m);
    
    if (reachedMilestones.length === 0) {
      console.log("No milestones reached yet");
      return new Response(JSON.stringify({ message: "No milestones reached" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check which milestones have already been notified
    const { data: existingNotifications } = await supabase
      .from("milestone_notifications")
      .select("milestone")
      .eq("website_id", websiteId);

    const notifiedMilestones = new Set(existingNotifications?.map(n => n.milestone) || []);
    const newMilestones = reachedMilestones.filter(m => !notifiedMilestones.has(m));

    if (newMilestones.length === 0) {
      console.log("All reached milestones already notified");
      return new Response(JSON.stringify({ message: "Already notified" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send email for the highest new milestone using Resend API
    const highestMilestone = Math.max(...newMilestones);
    
    console.log(`Sending milestone notification for ${highestMilestone} visitors`);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Analytics <onboarding@resend.dev>",
        to: [email],
        subject: `🎉 ${hostname} reached ${highestMilestone.toLocaleString()} visitors!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0;">🎉 Milestone Reached!</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 30px;">
              <p style="margin: 0 0 10px 0; font-size: 16px; opacity: 0.9;">Your website</p>
              <h2 style="margin: 0 0 20px 0; font-size: 24px;">${hostname}</h2>
              <p style="margin: 0; font-size: 18px;">has reached</p>
              <h1 style="margin: 10px 0; font-size: 48px; font-weight: bold;">${highestMilestone.toLocaleString()}</h1>
              <p style="margin: 0; font-size: 18px;">unique visitors!</p>
            </div>
            
            <p style="color: #6b7280; text-align: center; font-size: 14px;">
              Keep up the great work! Your analytics are growing. 📈
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
            
            <p style="color: #9ca3af; text-align: center; font-size: 12px;">
              This notification was sent because you enabled milestone alerts for ${hostname}.
            </p>
          </div>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    // Record all new milestones as notified
    for (const milestone of newMilestones) {
      await supabase
        .from("milestone_notifications")
        .insert({ website_id: websiteId, milestone });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      milestone: highestMilestone,
      emailResult 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-milestone-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
