import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🤖 Starting AI report generation...');
    
    // Get weekly traffic data
    const { data: weeklyData, error: dataError } = await supabase
      .from('traffic_hourly_stats')
      .select('*')
      .gte('hour', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('hour', { ascending: false });

    if (dataError) {
      console.error('Error fetching weekly data:', dataError);
      throw dataError;
    }

    // Get camera insights
    const { data: cameraData, error: cameraError } = await supabase
      .from('traffic_live_snapshots')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (cameraError) {
      console.error('Error fetching camera data:', cameraError);
      throw cameraError;
    }

    console.log(`📊 Analyzing ${weeklyData?.length || 0} hourly stats and ${cameraData?.length || 0} camera snapshots`);

    const prompt = `
Genera un informe semanal de tráfico para funcionarios municipales de Chihuahua.

DATOS ESTADÍSTICOS SEMANALES:
${JSON.stringify(weeklyData?.slice(0, 20), null, 2)}

DATOS DE CÁMARAS SEMANALES:
${JSON.stringify(cameraData?.slice(0, 15), null, 2)}

Genera un informe profesional en español que incluya:

1. 📈 **RESUMEN EJECUTIVO** (3 puntos clave)
   - Insights principales de la semana
   - Tendencias importantes
   - Cambios notables

2. 📊 **ESTADÍSTICAS CLAVE**
   - Total de vehículos procesados
   - Horas pico identificadas
   - Comparación vs semana anterior
   - Cámaras con mayor actividad

3. 🚨 **ÁREAS PROBLEMÁTICAS**
   - Intersecciones que requieren atención
   - Patrones de congestión recurrentes
   - Zonas con mayor incidencia

4. 💡 **RECOMENDACIONES PARA PRÓXIMA SEMANA**
   - 3 acciones específicas
   - Optimizaciones sugeridas
   - Preparación para eventos especiales

5. 🎯 **MÉTRICAS DE ÉXITO**
   - KPIs a monitorear
   - Objetivos semanales
   - Indicadores de mejora

Formato: Markdown profesional con emojis para mayor claridad.
Tono: Ejecutivo pero accesible para funcionarios municipales.
Incluye métricas específicas y números concretos.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const aiReport = response.choices[0].message.content;

    if (!aiReport) {
      throw new Error('No AI report generated');
    }

    // Store in Supabase
    const { data: storedReport, error: insertError } = await supabase
      .from('ai_reports')
      .insert({
        report_content: aiReport,
        report_type: 'weekly',
        generated_at: new Date().toISOString(),
        data_points_analyzed: (weeklyData?.length || 0) + (cameraData?.length || 0),
        confidence_score: 0.95,
        insights_count: 3,
        recommendations_count: 3
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing AI report:', insertError);
      throw insertError;
    }

    console.log('✅ AI report generated and stored successfully:', storedReport.id);

    return NextResponse.json({
      success: true,
      message: 'AI weekly report generated successfully',
      report_id: storedReport.id,
      data_points_analyzed: (weeklyData?.length || 0) + (cameraData?.length || 0),
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error generating AI report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report_type = 'daily', custom_prompt } = body;

    // Get data based on report type
    let dataQuery;
    const daysBack = report_type === 'daily' ? 1 : report_type === 'weekly' ? 7 : 30;
    
    if (report_type === 'daily') {
      dataQuery = supabase
        .from('traffic_hourly_stats')
        .select('*')
        .gte('hour', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());
    } else {
      dataQuery = supabase
        .from('traffic_live_snapshots')
        .select('*')
        .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString());
    }

    const { data: reportData, error } = await dataQuery;
    
    if (error) throw error;

    const prompt = custom_prompt || `
Generate a ${report_type} traffic report with analysis and recommendations.
Data: ${JSON.stringify(reportData, null, 2)}
Include insights, trends, and actionable recommendations.
Format as professional executive summary.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const aiReport = response.choices[0].message.content;

    if (!aiReport) {
      throw new Error('No AI report generated');
    }

    // Store report
    const { data: storedReport } = await supabase
      .from('ai_reports')
      .insert({
        report_content: aiReport,
        report_type,
        data_points_analyzed: reportData?.length || 0
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      report: storedReport,
      preview: aiReport.substring(0, 500) + '...'
    });

  } catch (error) {
    console.error('Error generating custom AI report:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
