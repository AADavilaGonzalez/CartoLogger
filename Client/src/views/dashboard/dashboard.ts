import { state } from "../../state";

import "./dashboard.css";
import html from "./dashboard.html?raw";

interface MapData {
    id: number;
    userId?: number;
    title: string;
    description: string;
    features?: any[];
}

export function Dashboard(root: HTMLElement): void {
    root.innerHTML = html;
    
    const mapsListElement = document.getElementById('maps-list') as HTMLElement;
    const loadingElement = document.getElementById('loading') as HTMLElement;
    const createMapBtn = document.getElementById('create-map-btn') as HTMLButtonElement;
    
    createMapBtn.addEventListener('click', handleCreateMap);
    
    loadUserMaps();
    
    async function loadUserMaps(): Promise<void> {
        try {
            const currentState = state.get();
            
            if (!currentState.userId) {
                showError('Usuario no autenticado');
                return;
            }
            
            // Intentar usar la API real, si falla usar datos mock
            try {
                const maps = await fetchUserMaps(currentState.userId);
                displayMaps(maps);
            } catch (apiError) {
                console.warn('API not available, using mock data:', apiError);
                const maps = await getMockMaps(currentState.userId);
                displayMaps(maps);
            }
            
        } catch (error) {
            console.error('Error loading maps:', error);
            showError('Error al cargar los mapas');
        }
    }
    
    async function fetchUserMaps(userId: number): Promise<MapData[]> {
        const response = await fetch(`http://localhost:7000/api/map/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch maps');
        return response.json();
    }
    
    // MockData
    async function getMockMaps(userId: number): Promise<MapData[]> {
        // Mock data para cuando la API no esté disponible
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        userId: userId,
                        title: "Mapa de la Ciudad",
                        description: "Un mapa detallado del centro de la ciudad con puntos de interés importantes."
                    },
                    {
                        id: 2,
                        userId: userId,
                        title: "Rutas de Senderismo",
                        description: "Colección de rutas de senderismo en la montaña con diferentes niveles de dificultad."
                    },
                    {
                        id: 3,
                        userId: userId,
                        title: "Campus Universitario",
                        description: "Mapa del campus con ubicaciones de edificios, estacionamientos y servicios estudiantiles."
                    }
                ]);
            }, 1000);
        });
    }
    
    function displayMaps(maps: MapData[]): void {
        loadingElement.style.display = 'none';
        
        if (maps.length === 0) {
            showNoMaps();
            return;
        }
        
        const mapsHtml = maps.map(map => createMapItemHtml(map)).join('');
        mapsListElement.innerHTML = mapsHtml;
        
        maps.forEach(map => {
            const mapElement = document.getElementById(`map-${map.id}`);
            const editBtn = document.getElementById(`edit-${map.id}`);
            const deleteBtn = document.getElementById(`delete-${map.id}`);
            
            if (mapElement) {
                mapElement.addEventListener('click', (e) => {
                    if (e.target === editBtn || e.target === deleteBtn) return;
                    handleMapClick(map);
                });
            }
            
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleEditMap(map);
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleDeleteMap(map);
                });
            }
        });
    }
    
    function createMapItemHtml(map: MapData): string {
        return `
            <div class="map-item" id="map-${map.id}">
                <h3>${escapeHtml(map.title)}</h3>
                <p>${escapeHtml(map.description)}</p>
                <div class="map-meta">
                    <span class="map-id">ID: ${map.id}</span>
                    <div class="map-actions">
                        <button class="edit-btn" id="edit-${map.id}">Editar</button>
                        <button class="delete-btn" id="delete-${map.id}">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showNoMaps(): void {
        mapsListElement.innerHTML = `
            <div class="no-maps">
                <div class="icon">🗺️</div>
                <h3>No tienes mapas todavía</h3>
                <p>Crea tu primer mapa para comenzar a explorar y organizar tu información geográfica.</p>
            </div>
        `;
    }
    
    function showError(message: string): void {
        loadingElement.style.display = 'none';
        mapsListElement.innerHTML = `
            <div class="no-maps">
                <div class="icon">⚠️</div>
                <h3>Error</h3>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }
    
    // FALTA, NO SE QUE ENDPOINT USAR NI A DONDE MANDAR A LA PAGINA
    function handleMapClick(map: MapData): void {
        console.log('Opening map:', map);
        // Ir a la pagina del mapa
        // window.location.hash = `#/editor/${map.id}`;
        alert(`Abriendo mapa: ${map.title}`);
    }
    
    // ENDPOINT COLOCADO, NO SE QUE MAS FALTA
    function handleCreateMap(): void {
        console.log('Creating new map');
        // Ir a una pagina vacia para crear mapa nuevo
        // window.location.hash = 'api/map/create';
        alert('Función para crear nuevo mapa');
    }
    
    
    // ENDPOINT COLOCADO, NO SE COMO ACTUALIZAR LA BASE DE DATOS
    async function handleEditMap(map: MapData): Promise<void> {
        console.log('Editing map:', map);
        // TODO: Editar titulo de mapas
        // No se si esta correcto lo de await fetch
        try {
            await fetch('api/map/update/${map.id}', {method: 'POST'});
            alert(`Editando mapa: ${map.title}`);
            loadUserMaps();
        } catch (error) {
            console.error('Error renaming map', error);
            alert('Error al cambiar el nombre del mapa');
        }


    }
    
    async function handleDeleteMap(map: MapData): Promise<void> {
        if (!confirm(`¿Estás seguro de que quieres eliminar el mapa "${map.title}"?`)) {
            return;
        }
        
        try {
            // TODO: Borrar mapa de base de datos
            // No se si esta bien
            await fetch(`/api/map/delete/${map.id}`, { method: 'POST' });
            
            console.log('Deleting map:', map);
            alert(`Mapa "${map.title}" eliminado (simulado)`);
            
            // Volver a cargar mapas despues del eliminado
            loadUserMaps();
            
        } catch (error) {
            console.error('Error deleting map:', error);
            alert('Error al eliminar el mapa');
        }
    }
    
    function escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
