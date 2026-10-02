/**
 * Dynamic ESM Loader for ArcGIS Maps SDK for JavaScript
 * Uses browser-native ESM loading linked through importmap or direct CDN.
 */

export interface ArcGISModules {
  esriConfig: any;
  Map: any;
  MapView: any;
  SceneView: any;
  GraphicsLayer: any;
  GeoJSONLayer: any;
  SceneLayer: any;
  WebTileLayer: any;
  VectorTileLayer: any;
  Basemap: any;
  Graphic: any;
  Point: any;
  Polyline: any;
  Polygon: any;
  webMercatorUtils: any;
  geometryEngine: any;
  locator: any;
  serviceArea: any;
  ServiceAreaParameters: any;
  closestFacility: any;
  ClosestFacilityParameters: any;
  route: any;
  RouteParameters: any;
  FeatureSet: any;
  SketchViewModel: any;
  BasemapToggle: any;
  BasemapGallery: any;
}

let cachedModules: ArcGISModules | null = null;
let loadingPromise: Promise<ArcGISModules> | null = null;

const ARCGIS_CDN_BASE = 'https://js.arcgis.com/5.1/@arcgis/core';

/**
 * Execute native browser dynamic import using new Function.
 * This prevents Vite's static AST scanner from trying to resolve the import against node_modules.
 */
function importArcgisModule(subpath: string): Promise<any> {
  const dynamicImport = new Function('specifier', 'return import(specifier)');
  return dynamicImport(`${ARCGIS_CDN_BASE}/${subpath}`);
}

export async function loadArcGIS(): Promise<ArcGISModules> {
  if (cachedModules) {
    return cachedModules;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      // Dynamic import of ArcGIS core modules directly from CDN 5.1 via native browser ESM
      const [
        esriConfigMod,
        MapMod,
        MapViewMod,
        SceneViewMod,
        GraphicsLayerMod,
        GeoJSONLayerMod,
        SceneLayerMod,
        WebTileLayerMod,
        GraphicMod,
        PointMod,
        PolylineMod,
        PolygonMod,
        webMercatorUtilsMod,
        geometryEngineMod,
        locatorMod,
        serviceAreaMod,
        ServiceAreaParametersMod,
        closestFacilityMod,
        ClosestFacilityParametersMod,
        routeMod,
        RouteParametersMod,
        FeatureSetMod,
        SketchViewModelMod,
        BasemapToggleMod,
        BasemapGalleryMod,
        VectorTileLayerMod,
        BasemapMod
      ] = await Promise.all([
        importArcgisModule('config.js'),
        importArcgisModule('Map.js'),
        importArcgisModule('views/MapView.js'),
        importArcgisModule('views/SceneView.js'),
        importArcgisModule('layers/GraphicsLayer.js'),
        importArcgisModule('layers/GeoJSONLayer.js'),
        importArcgisModule('layers/SceneLayer.js'),
        importArcgisModule('layers/WebTileLayer.js'),
        importArcgisModule('Graphic.js'),
        importArcgisModule('geometry/Point.js'),
        importArcgisModule('geometry/Polyline.js'),
        importArcgisModule('geometry/Polygon.js'),
        importArcgisModule('geometry/support/webMercatorUtils.js'),
        importArcgisModule('geometry/geometryEngine.js'),
        importArcgisModule('rest/locator.js'),
        importArcgisModule('rest/serviceArea.js'),
        importArcgisModule('rest/support/ServiceAreaParameters.js'),
        importArcgisModule('rest/closestFacility.js'),
        importArcgisModule('rest/support/ClosestFacilityParameters.js'),
        importArcgisModule('rest/route.js'),
        importArcgisModule('rest/support/RouteParameters.js'),
        importArcgisModule('rest/support/FeatureSet.js'),
        importArcgisModule('widgets/Sketch/SketchViewModel.js'),
        importArcgisModule('widgets/BasemapToggle.js'),
        importArcgisModule('widgets/BasemapGallery.js'),
        importArcgisModule('layers/VectorTileLayer.js'),
        importArcgisModule('Basemap.js')
      ]);

      cachedModules = {
        esriConfig: esriConfigMod.default || esriConfigMod,
        Map: MapMod.default || MapMod,
        MapView: MapViewMod.default || MapViewMod,
        SceneView: SceneViewMod.default || SceneViewMod,
        GraphicsLayer: GraphicsLayerMod.default || GraphicsLayerMod,
        GeoJSONLayer: GeoJSONLayerMod.default || GeoJSONLayerMod,
        SceneLayer: SceneLayerMod.default || SceneLayerMod,
        WebTileLayer: WebTileLayerMod.default || WebTileLayerMod,
        VectorTileLayer: VectorTileLayerMod.default || VectorTileLayerMod,
        Basemap: BasemapMod.default || BasemapMod,
        Graphic: GraphicMod.default || GraphicMod,
        Point: PointMod.default || PointMod,
        Polyline: PolylineMod.default || PolylineMod,
        Polygon: PolygonMod.default || PolygonMod,
        webMercatorUtils: webMercatorUtilsMod,
        geometryEngine: geometryEngineMod,
        locator: locatorMod,
        serviceArea: serviceAreaMod,
        ServiceAreaParameters: ServiceAreaParametersMod.default || ServiceAreaParametersMod,
        closestFacility: closestFacilityMod,
        ClosestFacilityParameters: ClosestFacilityParametersMod.default || ClosestFacilityParametersMod,
        route: routeMod,
        RouteParameters: RouteParametersMod.default || RouteParametersMod,
        FeatureSet: FeatureSetMod.default || FeatureSetMod,
        SketchViewModel: SketchViewModelMod.default || SketchViewModelMod,
        BasemapToggle: BasemapToggleMod.default || BasemapToggleMod,
        BasemapGallery: BasemapGalleryMod.default || BasemapGalleryMod
      };

      return cachedModules;
    } catch (err) {
      console.error('Failed to load ArcGIS ES Modules from CDN:', err);
      throw err;
    }
  })();

  return loadingPromise;
}
