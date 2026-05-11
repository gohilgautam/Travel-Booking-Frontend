import { API_BASE_URL } from './api';

export interface CreatePackageInput {
  title: string;
  description: string;
  destination: string;
  duration: number;
  price: number;
  location?: string;
  category?: string;
  discountPrice?: number;
  highlights?: string[];
  includes?: string[];
  amenities?: string[];
  itinerary?: string[];
  maxGroupSize?: number;
  emoji?: string;
  gradient?: string;
  featured?: boolean;
}

const appendListField = (formData: FormData, key: string, values?: string[]) => {
  if (!values || values.length === 0) return;
  formData.append(key, values.join(','));
};

export const buildCreatePackageFormData = (
  payload: CreatePackageInput,
  images: File[]
) => {
  const formData = new FormData();

  formData.append('title', payload.title);
  formData.append('description', payload.description);
  formData.append('destination', payload.destination);
  formData.append('duration', String(payload.duration));
  formData.append('price', String(payload.price));

  if (payload.location) formData.append('location', payload.location);
  if (payload.category) formData.append('category', payload.category);
  if (payload.discountPrice !== undefined) formData.append('discountPrice', String(payload.discountPrice));
  if (payload.maxGroupSize !== undefined) formData.append('maxGroupSize', String(payload.maxGroupSize));
  if (payload.emoji) formData.append('emoji', payload.emoji);
  if (payload.gradient) formData.append('gradient', payload.gradient);
  if (payload.featured !== undefined) formData.append('featured', String(payload.featured));

  appendListField(formData, 'highlights', payload.highlights);
  appendListField(formData, 'includes', payload.includes);
  appendListField(formData, 'amenities', payload.amenities);
  appendListField(formData, 'itinerary', payload.itinerary);

  images.forEach((file) => {
    formData.append('images', file);
  });

  return formData;
};

export const createPackageApi = async (
  payload: CreatePackageInput,
  images: File[],
  token: string,
  apiBaseUrl = API_BASE_URL
) => {
  if (images.length === 0) {
    throw new Error('Please select at least one image');
  }

  const formData = buildCreatePackageFormData(payload, images);

  const response = await fetch(`${apiBaseUrl}/packages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to create package');
  }

  return data;
};

/*
Usage in Add Package form submit:

const [images, setImages] = useState<File[]>([]);

<input
  type="file"
  multiple
  accept="image/*"
  onChange={(e) => setImages(Array.from(e.target.files || []))}
/>

await createPackageApi(
  {
    title: form.title,
    description: form.description,
    destination: form.destination,
    duration: Number(form.duration),
    price: Number(form.price),
    location: form.location,
    highlights: form.highlightsCsv.split(',').map(v => v.trim()).filter(Boolean),
    includes: form.includesCsv.split(',').map(v => v.trim()).filter(Boolean),
  },
  images,
  authToken
);
*/
