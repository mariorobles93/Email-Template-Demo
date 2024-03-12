import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {createClient} from "npm:@supabase/supabase-js@2.39.7";

const RESEND_API_KEY = 're_2uuwBCTH_NS2iVfdEgm4QnTaMuGqtRgZa';

const supabase = createClient('https://metaroxtujqnlvsksdjc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldGFyb3h0dWpxbmx2c2tzZGpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MzY3MDksImV4cCI6MjAyNTQxMjcwOX0.1MosjazlOJE2FaoChtwjWvk2p6THB7Ziss2q-JXL6ps')

const handler = async (_request: Request): Promise<Response> => {
  const requestText : any = await _request.text();

  //Prevents duplicate calls when calling from browser
  //https://stackoverflow.com/questions/75710032/supabase-edge-function-running-twice-but-just-one-call
  if (_request.method === 'OPTIONS') {
    return new Response('ok', { headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } })
  }

  const requestTextAsString = requestText.toString();
  const templateId = JSON.parse(requestTextAsString);

  const {data: supabaseResponse, error} = await supabase
    .from('email_template_demo')
    .select('template, template_id, subject, email_list')
    .eq('template_id', templateId.templateId)
    .limit(1)
    .single();

  console.log(`Supabase Response: ${JSON.stringify(supabaseResponse)}`);
  console.log(`Template ID: ${templateId.templateId}`);
  console.log(`Template: ${supabaseResponse?.template}`);
  console.error(error);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'Email Template Demo <no-reply@mariorobles.tech>',
      to: supabaseResponse?.email_list,
      subject: `${supabaseResponse?.subject}`,
      html: `${supabaseResponse?.template} `,
    })
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
    },
  });
};

serve(handler);
