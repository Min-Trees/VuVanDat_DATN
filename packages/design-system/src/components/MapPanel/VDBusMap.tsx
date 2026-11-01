import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import './MapPanel.css';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  status?: 'Moving' | 'Stopped' | 'Warning' | 'Offline' | 'Pickup' | 'Delivery' | 'Warehouse' | 'Port';
  heading?: number; // 0 - 360
  popupContent?: string;
  onClick?: () => void;
}

export interface MapPolylineItem {
  id: string;
  points: [number, number][];
  color?: string;
  weight?: number;
  dashArray?: string;
  opacity?: number;
}

export interface MapCircleItem {
  id: string;
  center: [number, number];
  radiusMeters: number;
  name: string;
  color?: string;
}

export interface VDBusMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarkerItem[];
  polylines?: MapPolylineItem[];
  circles?: MapCircleItem[];
  height?: string | number;
  className?: string;
  selectedMarkerId?: string;
  onMarkerClick?: (marker: MapMarkerItem) => void;
}

export const VDBusMap: React.FC<VDBusMapProps> = ({
  center = [16.074, 108.182], // Danang default center
  zoom = 12,
  markers = [],
  polylines = [],
  circles = [],
  height = 420,
  className = '',
  selectedMarkerId,
  onMarkerClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      // Standard OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | VDBus TMS GIS',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      polylinesLayerRef.current = L.layerGroup().addTo(map);
      circlesLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Pan / Recenter when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // 3. Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach((item) => {
      let pinColor = 'var(--vdbus-color-primary, #2563eb)';
      let badgeLabel = item.title;

      if (item.status === 'Moving') pinColor = 'var(--vdbus-color-success, #16a34a)';
      else if (item.status === 'Stopped') pinColor = 'var(--vdbus-color-warning, #ea580c)';
      else if (item.status === 'Warning') pinColor = 'var(--vdbus-color-error, #dc2626)';
      else if (item.status === 'Offline') pinColor = 'var(--vdbus-color-text-muted, #64748b)';
      else if (item.status === 'Pickup') pinColor = 'var(--vdbus-color-info, #0284c7)';
      else if (item.status === 'Delivery') pinColor = 'var(--vdbus-color-purple, #7c3aed)';

      const isSelected = selectedMarkerId === item.id;
      const heading = item.heading || 0;

      // Custom HTML Marker Icon
      const iconHtml = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -50%);
          cursor: pointer;
        ">
          <div style="
            background-color: ${pinColor};
            color: var(--vdbus-color-text-inverse, #ffffff);
            font-size: 11px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: var(--vdbus-radius-xs, 4px);
            box-shadow: var(--vdbus-shadow-sm);
            white-space: nowrap;
            border: ${isSelected ? '2px solid var(--vdbus-color-text-inverse, #ffffff)' : '1px solid var(--vdbus-color-border-subtle)'};
            margin-bottom: 2px;
          ">
            ${badgeLabel}
          </div>
          <div style="
            width: 24px;
            height: 24px;
            background-color: ${pinColor};
            border-radius: 50%;
            border: 2px solid var(--vdbus-color-text-inverse, #ffffff);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--vdbus-shadow-md);
            transform: rotate(${heading}deg);
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--vdbus-color-text-inverse, #ffffff)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
            </svg>
          </div>
        </div>
      `;

      const divIcon = L.divIcon({
        className: 'vdbus-custom-marker',
        html: iconHtml,
        iconSize: [60, 48],
        iconAnchor: [30, 24],
      });

      const marker = L.marker([item.lat, item.lng], { icon: divIcon });

      if (item.popupContent) {
        marker.bindPopup(item.popupContent);
      } else {
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
            <strong>${item.title}</strong>
            ${item.subtitle ? `<br/><span style="color: var(--vdbus-color-text-muted);">${item.subtitle}</span>` : ''}
            <br/><span>Trạng thái: <strong>${item.status || 'Hoạt động'}</strong></span>
          </div>
        `);
      }

      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(item);
        if (item.onClick) item.onClick();
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [markers, selectedMarkerId]);

  // 4. Render Polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !polylinesLayerRef.current) return;

    polylinesLayerRef.current.clearLayers();

    polylines.forEach((line) => {
      const polyline = L.polyline(line.points, {
        color: line.color || 'var(--vdbus-color-primary, #2563eb)',
        weight: line.weight || 4,
        dashArray: line.dashArray,
        opacity: line.opacity || 0.85,
      });
      polylinesLayerRef.current?.addLayer(polyline);
    });
  }, [polylines]);

  // 5. Render Circles (Geofences)
  useEffect(() => {
    if (!mapInstanceRef.current || !circlesLayerRef.current) return;

    circlesLayerRef.current.clearLayers();

    circles.forEach((c) => {
      const circle = L.circle(c.center, {
        radius: c.radiusMeters,
        color: c.color || 'var(--vdbus-color-info, #0284c7)',
        fillColor: c.color || 'var(--vdbus-color-info, #0284c7)',
        fillOpacity: 0.12,
        weight: 1.5,
      });

      circle.bindTooltip(c.name, {
        permanent: false,
        direction: 'top',
        className: 'vdbus-geofence-tooltip',
      });

      circlesLayerRef.current?.addLayer(circle);
    });
  }, [circles]);

  return (
    <div
      ref={mapContainerRef}
      className={['vdbus-map-container', className].filter(Boolean).join(' ')}
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 'var(--vdbus-radius-md)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}
    />
  );
};
