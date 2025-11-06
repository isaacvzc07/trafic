import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Usar SQL directo para crear la tabla
    const { data, error } = await supabase
      .from('camera_snapshots')
      .select('count')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // La tabla no existe, intentar crearla
      try {
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE camera_snapshots (
              id SERIAL PRIMARY KEY,
              camera_id VARCHAR(50) NOT NULL,
              incident_type VARCHAR(100),
              description TEXT,
              snapshot_url TEXT,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX idx_camera_snapshots_camera_id ON camera_snapshots(camera_id);
            CREATE INDEX idx_camera_snapshots_timestamp ON camera_snapshots(timestamp);
          `
        });

        if (createError) {
          console.error('Error creating table:', createError);
          return NextResponse.json({
            success: false,
            error: 'No se pudo crear la tabla',
            details: createError.message,
            manual_sql: `
              -- Ejecutar manualmente en Supabase SQL Editor:
              CREATE TABLE camera_snapshots (
                id SERIAL PRIMARY KEY,
                camera_id VARCHAR(50) NOT NULL,
                incident_type VARCHAR(100),
                description TEXT,
                snapshot_url TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              );
              
              CREATE INDEX idx_camera_snapshots_camera_id ON camera_snapshots(camera_id);
              CREATE INDEX idx_camera_snapshots_timestamp ON camera_snapshots(timestamp);
            `
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Tabla creada exitosamente'
        });

      } catch (createErr: unknown) {
        return NextResponse.json({
          success: false,
          error: 'Error al inicializar la base de datos',
          details: createErr instanceof Error ? createErr.message : String(createErr),
          manual_sql: `
            -- Ejecutar manualmente en Supabase SQL Editor:
            CREATE TABLE camera_snapshots (
              id SERIAL PRIMARY KEY,
              camera_id VARCHAR(50) NOT NULL,
              incident_type VARCHAR(100),
              description TEXT,
              snapshot_url TEXT,
              timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `
        }, { status: 500 });
      }
    }

    // La tabla ya existe
    return NextResponse.json({
      success: true,
      message: 'La tabla ya existe',
      table_exists: true
    });

  } catch (error: unknown) {
    console.error('Error initializing database:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
