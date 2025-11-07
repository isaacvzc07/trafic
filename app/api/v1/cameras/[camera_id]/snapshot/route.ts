import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ camera_id: string }> }
) {
  try {
    const { camera_id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Validar camera_id
    const validCameras = ['cam_01', 'cam_02', 'cam_03', 'cam_04'];
    if (!validCameras.includes(camera_id)) {
      return NextResponse.json(
        { error: 'Cámara no válida' },
        { status: 400 }
      );
    }

    // Obtener parámetros de la imagen
    const width = searchParams.get('width') || '1280';
    const height = searchParams.get('height') || '720';
    const format = searchParams.get('format') || 'jpeg';

    // Conectar a la API real de trafic.mx
    const snapshotUrl = `https://api.trafic.mx/api/v1/cameras/${camera_id}/snapshot?width=${width}&height=${height}&format=${format}`;
    
    try {
      const response = await fetch(snapshotUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Trafic.mx-Dashboard/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // Obtener la imagen como buffer
      const imageBuffer = await response.arrayBuffer();
      
      // Determinar el content type basado en el formato
      const contentType = format === 'png' ? 'image/png' : 'image/jpeg';

      // Devolver la imagen directamente
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=30', // Cache por 30 segundos
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (apiError) {
      console.error('Error fetching from trafic.mx API:', apiError);
      
      // Si la API real falla, devolver una imagen de placeholder
      return NextResponse.json({
        success: false,
        camera_id,
        error: 'No se pudo obtener el snapshot de la cámara',
        timestamp: new Date().toISOString(),
        fallback_url: snapshotUrl
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error('Error al obtener snapshot:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ camera_id: string }> }
) {
  try {
    const { camera_id } = await params;
    
    // Validar camera_id
    const validCameras = ['cam_01', 'cam_02', 'cam_03', 'cam_04'];
    if (!validCameras.includes(camera_id)) {
      return NextResponse.json(
        { error: 'Cámara no válida' },
        { status: 400 }
      );
    }

    // Guardar snapshot en la base de datos (mock temporal)
    const body = await request.json();
    const { incident_type, description, snapshot_url } = body;

    // Simular guardado exitoso
    const mockSnapshotId = Math.floor(Math.random() * 1000) + 1;

    return NextResponse.json({
      success: true,
      camera_id,
      incident_type,
      description,
      snapshot_id: mockSnapshotId,
      timestamp: new Date().toISOString(),
      message: 'Snapshot guardado (mock temporal)',
      note: "PostgreSQL configurado. Para activar real: npm install pg @types/pg && reiniciar servidor"
    });

  } catch (error: unknown) {
    console.error('Error al guardar snapshot:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
