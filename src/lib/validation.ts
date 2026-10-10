import { HandView } from './supabase';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_VIEWS: HandView[] = ['right_palm', 'right_back', 'left_palm', 'left_back', 'd1_chart'];
const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];

export function isValidUuid(id: unknown): id is string {
  return typeof id === 'string' && UUID_REGEX.test(id.trim());
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function validateHandProfilePayload(body: any): ValidationResult<any> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { success: false, error: 'Request body must be a valid JSON object' };
  }

  // Validate ID
  if (!body.id || typeof body.id !== 'string') {
    return { success: false, error: 'Field "id" is required and must be a string' };
  }
  const cleanId = body.id.trim();
  if (!isValidUuid(cleanId)) {
    return { success: false, error: 'Field "id" must be a valid UUID format' };
  }

  // Validate Name
  if (!body.name || typeof body.name !== 'string') {
    return { success: false, error: 'Field "name" is required and must be a string' };
  }
  const cleanName = body.name.trim();
  if (cleanName.length < 1 || cleanName.length > 200) {
    return { success: false, error: 'Field "name" must be between 1 and 200 characters' };
  }

  // Validate Dominant Hand
  const dominantHand = body.dominant_hand === 'Left' ? 'Left' : 'Right';

  // Validate Age
  let age: number | null = null;
  if (body.age !== undefined && body.age !== null && body.age !== '') {
    const parsedAge = typeof body.age === 'number' ? body.age : parseInt(String(body.age), 10);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
      return { success: false, error: 'Field "age" must be a valid integer between 0 and 130' };
    }
    age = parsedAge;
  }

  // Validate Strings (optional)
  const sanitizeString = (val: any, maxLen: number): string | null => {
    if (typeof val !== 'string') return null;
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed.slice(0, maxLen) : null;
  };

  const gender = sanitizeString(body.gender, 50);
  const dob = sanitizeString(body.dob, 100);
  const tob = sanitizeString(body.tob, 100);
  const pob = sanitizeString(body.pob, 200);

  let generalNotes = '';
  if (typeof body.general_notes === 'string') {
    generalNotes = body.general_notes.slice(0, 500000);
  }

  // Validate Images
  let images: Record<string, string> = {};
  if (body.images && typeof body.images === 'object' && !Array.isArray(body.images)) {
    for (const [k, v] of Object.entries(body.images)) {
      if (typeof v === 'string') {
        images[k] = v.slice(0, 500000);
      }
    }
  }

  // Validate Mounts & Lines Data
  let mountsData: Record<string, string> = {};
  if (body.mounts_data && typeof body.mounts_data === 'object' && !Array.isArray(body.mounts_data)) {
    for (const [k, v] of Object.entries(body.mounts_data)) {
      if (typeof v === 'string') mountsData[k] = v.slice(0, 50000);
    }
  }

  let linesData: Record<string, string> = {};
  if (body.lines_data && typeof body.lines_data === 'object' && !Array.isArray(body.lines_data)) {
    for (const [k, v] of Object.entries(body.lines_data)) {
      if (typeof v === 'string') linesData[k] = v.slice(0, 50000);
    }
  }

  // Validate Pins
  let pins: any[] = [];
  if (Array.isArray(body.pins)) {
    if (body.pins.length > 500) {
      return { success: false, error: 'A profile cannot have more than 500 markers/pins' };
    }
    for (const pin of body.pins) {
      if (!pin || typeof pin !== 'object') continue;
      const x = typeof pin.x === 'number' ? Math.max(0, Math.min(100, pin.x)) : 50;
      const y = typeof pin.y === 'number' ? Math.max(0, Math.min(100, pin.y)) : 50;
      pins.push({
        id: typeof pin.id === 'string' ? pin.id.slice(0, 100) : crypto.randomUUID(),
        view: VALID_VIEWS.includes(pin.view) ? pin.view : 'right_palm',
        x,
        y,
        label: typeof pin.label === 'string' ? pin.label.slice(0, 200) : 'Marker',
        description: typeof pin.description === 'string' ? pin.description.slice(0, 5000) : '',
        color: typeof pin.color === 'string' ? pin.color.slice(0, 50) : '#f59e0b',
      });
    }
  }

  // Validate Drawings
  let drawings: any[] = [];
  if (Array.isArray(body.drawings)) {
    if (body.drawings.length > 200) {
      return { success: false, error: 'A profile cannot have more than 200 drawn lines' };
    }
    for (const d of body.drawings) {
      if (!d || typeof d !== 'object') continue;
      const points: Array<{ x: number; y: number }> = [];
      if (Array.isArray(d.points)) {
        for (const pt of d.points.slice(0, 5000)) {
          if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
            points.push({
              x: Math.max(0, Math.min(100, pt.x)),
              y: Math.max(0, Math.min(100, pt.y)),
            });
          }
        }
      }
      drawings.push({
        id: typeof d.id === 'string' ? d.id.slice(0, 100) : crypto.randomUUID(),
        view: VALID_VIEWS.includes(d.view) ? d.view : 'right_palm',
        points,
        color: typeof d.color === 'string' ? d.color.slice(0, 50) : '#3b82f6',
        thickness: typeof d.thickness === 'number' ? Math.max(1, Math.min(20, d.thickness)) : 3,
        label: typeof d.label === 'string' ? d.label.slice(0, 100) : undefined,
      });
    }
  }

  // Validate Tags
  let tags: string[] = [];
  if (Array.isArray(body.tags)) {
    tags = body.tags
      .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
      .slice(0, 50)
      .map((t: string) => t.trim().slice(0, 50));
  }

  return {
    success: true,
    data: {
      id: cleanId,
      name: cleanName,
      age,
      gender,
      dominant_hand: dominantHand,
      images,
      general_notes: generalNotes,
      mounts_data: mountsData,
      lines_data: linesData,
      pins,
      drawings,
      tags,
      dob,
      tob,
      pob,
    },
  };
}

export function validateUploadMetadata(
  rawFilename: string | null,
  contentType: string | null,
  contentLength: string | null
): ValidationResult<{ sanitizedFilename: string }> {
  // 1. Content-Length check
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (!isNaN(size) && size > MAX_UPLOAD_SIZE) {
      return { success: false, error: `File size exceeds the 15MB limit (received ${(size / (1024 * 1024)).toFixed(1)}MB)` };
    }
  }

  // 2. Filename validation and sanitization
  const fallbackName = `hand-${Date.now()}.jpg`;
  const baseName = (rawFilename || fallbackName).split('/').pop()?.split('\\').pop() || fallbackName;
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  const extMatch = sanitized.match(/\.[a-zA-Z0-9]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : '';

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      success: false,
      error: `Invalid file extension "${ext}". Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // 3. Content-Type check if present
  if (contentType) {
    const lowerType = contentType.toLowerCase();
    const isImage = lowerType.startsWith('image/') || lowerType === 'application/octet-stream';
    if (!isImage) {
      return {
        success: false,
        error: `Invalid content type "${contentType}". Only image uploads are permitted.`,
      };
    }
  }

  return {
    success: true,
    data: { sanitizedFilename: sanitized },
  };
}
