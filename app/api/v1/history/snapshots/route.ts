import { NextRequest, NextResponse } from 'next/server';

// Mock data temporal hasta que pg esté disponible
let mockSnapshots: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const camera_id = searchParams.get('camera_id');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filtrar datos mock
    let filteredData = mockSnapshots;
    if (camera_id) {
      filteredData = mockSnapshots.filter(s => s.camera_id === camera_id);
    }

    // Paginar
    const paginatedData = filteredData.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: filteredData.length,
        limit,
        offset,
        has_more: offset + limit < filteredData.length
      },
      note: "Usando datos mock temporal. PostgreSQL configurado pero esperando instalación de paquetes."
    });

  } catch (error: unknown) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Agregar a datos mock
    const newSnapshot = {
      id: mockSnapshots.length + 1,
      camera_id: body.camera_id || 'unknown',
      incident_type: body.incident_type,
      description: body.description,
      snapshot_url: body.snapshot_url,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    mockSnapshots.unshift(newSnapshot);

    return NextResponse.json({
      success: true,
      camera_id: body.camera_id,
      incident_type: body.incident_type,
      description: body.description,
      snapshot_id: newSnapshot.id,
      timestamp: newSnapshot.timestamp,
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const snapshot_id = searchParams.get('snapshot_id');

    if (!snapshot_id) {
      return NextResponse.json(
        { error: 'ID de snapshot requerido' },
        { status: 400 }
      );
    }

    // Eliminar de datos mock
    const initialLength = mockSnapshots.length;
    mockSnapshots = mockSnapshots.filter(s => s.id !== parseInt(snapshot_id));

    if (mockSnapshots.length === initialLength) {
      return NextResponse.json(
        { error: 'Snapshot no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Snapshot eliminado (mock temporal)',
      note: "PostgreSQL configurado. Para activar real: npm install pg @types/pg && reiniciar servidor"
    });

  } catch (error: unknown) {
    console.error('Error al eliminar snapshot:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
