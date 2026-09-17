// ============================================================
// CreateListingPage.jsx
// Feature: Vendor Portal → Create/Edit Listing Multi-Step Wizard
// Turn 1: Wizard scaffold, step navigation, Venue Spaces component,
// and reusable primitives (Toggle, MultiSelect, FormField).
// ============================================================

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Building2,
  Camera,
  Music2,
  UtensilsCrossed,
  Sparkles,
  DollarSign,
  Save,
  Eye,
  Info,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
  Star,
  Plus,
} from 'lucide-react';
import Toggle from '../components/common/Toggle';
import MultiSelect from '../components/common/MultiSelect';
import FormField from '../components/common/FormField';
import Badge from '../components/common/Badge';
import VenueSpacesEditor from '../components/listing-form/VenueSpacesEditor';
import HotelVenueDetails from '../components/listing-form/HotelVenueDetails';
import PhotographyDetails from '../components/listing-form/PhotographyDetails';
import MusicDetails from '../components/listing-form/MusicDetails';
import DecorationsDetails from '../components/listing-form/DecorationsDetails';
import CateringDetails from '../components/listing-form/CateringDetails';

export const LISTING_CATEGORIES = [
  'Hotel / Venue',
  'Photography',
  'Decorations',
  'Catering',
  'Music',
];

const API_BASE = 'http://localhost:5131/api/vendor-content';

const STEPS = [
  { id: 1, label: 'Basic Info & Category', desc: 'Title, category, starting rate' },
  { id: 2, label: 'Category Specifications', desc: 'Spaces, parameters & attributes' },
  { id: 3, label: 'Photos & Media', desc: 'Cover photo & gallery preview' },
  { id: 4, label: 'Review & Publish', desc: 'Overview and status' },
];

const CATEGORY_META = {
  'Hotel / Venue': {
    icon: Building2,
    desc: 'Banquet halls, luxury hotels, gardens, and reception pavilions',
  },
  Photography: {
    icon: Camera,
    desc: 'Wedding coverage, pre-shoots, portraits, and albums',
  },
  Music: {
    icon: Music2,
    desc: 'Live bands, DJs, acoustic ensembles, and soloists',
  },
  Catering: {
    icon: UtensilsCrossed,
    desc: 'Buffets, plated dinners, cocktails, and cake structures',
  },
  Decorations: {
    icon: Sparkles,
    desc: 'Floral styling, stage backdrops, balloon arches, and lighting',
  },
};

const inputCls =
  'w-full rounded-xl border border-[#E8DDE4] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] outline-none placeholder:text-[#94A3B8] focus:border-[#8E406F] focus:ring-2 focus:ring-[#8E406F]/15 transition';

const SAMPLE_PRESET_IMAGES = [
  {
    id: 'sample-img-1',
    name: 'wedding-ballroom-decor.jpg',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    size: '1.8 MB',
    isCover: true,
  },
  {
    id: 'sample-img-2',
    name: 'ceremony-outdoor-garden.jpg',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    size: '2.4 MB',
    isCover: false,
  },
  {
    id: 'sample-img-3',
    name: 'table-floral-arrangements.jpg',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    size: '2.1 MB',
    isCover: false,
  },
];

function buildInitialFormData(existingListing = null) {
  return {
    title: existingListing?.title || '',
    category: existingListing?.category || 'Hotel / Venue',
    priceOnRequest: existingListing ? (existingListing.priceOnRequest ?? existingListing.price === null) : false,
    price: existingListing?.price !== null && existingListing?.price !== undefined ? existingListing.price : '',
    // Short Description shown on search/directory cards (max 200 chars)
    description: existingListing?.description || '',
    // Full Description shown on the dedicated listing detail page
    fullDescription: existingListing?.fullDescription || existingListing?.description || '',
    status: existingListing?.status || 'Active',
    // Media & Photos state
    images: (existingListing?.images || []).length
      ? existingListing.images.map((img, idx) => ({
          id: img.imageId ? `img-${img.imageId}` : `img-existing-${idx}`,
          imageId: img.imageId,
          name: img.imageUrl ? img.imageUrl.split('/').pop() : `Photo ${idx + 1}`,
          url: img.imageUrl?.startsWith('/') ? `http://localhost:5131${img.imageUrl}` : (img.imageUrl || img.url),
          isCover: Boolean(img.isCover || (existingListing.coverImageUrl && existingListing.coverImageUrl === img.imageUrl)),
        }))
      : (existingListing?.coverImageUrl
          ? [{
              id: 'img-cover',
              name: existingListing.coverImageUrl.split('/').pop() || 'Cover photo',
              url: existingListing.coverImageUrl.startsWith('/') ? `http://localhost:5131${existingListing.coverImageUrl}` : existingListing.coverImageUrl,
              isCover: true,
            }]
          : []),
    // Details object for category specific data
    details: {
      // Spaces (Repeatable)
      spaces: (existingListing?.spaces || existingListing?.details?.spaces || []).length
        ? (existingListing?.spaces || existingListing?.details?.spaces).map((s, idx) => ({
            id: s.spaceId ? `space-${s.spaceId}` : (s.id || `space-${idx + 1}`),
            spaceId: s.spaceId || s.venueSpaceId,
            name: s.name || '',
            type: s.type || 'Indoor Ballroom',
            capacitySeated: s.capacitySeated !== undefined && s.capacitySeated !== null ? String(s.capacitySeated) : '',
            capacityFloating: s.capacityFloating !== undefined && s.capacityFloating !== null ? String(s.capacityFloating) : '',
            isAirConditioned: s.isAirConditioned ?? true,
            description: s.description || '',
          }))
        : [
            {
              id: 'space-1',
              name: 'Grand Ballroom',
              type: 'Indoor Ballroom',
              capacitySeated: '350',
              capacityFloating: '500',
              isAirConditioned: true,
              description: 'Spacious banquet hall with crystal chandeliers and stage lighting.',
            },
          ],
      // 1. Top-Level Venue Specifications
      venueType: existingListing?.details?.venueType || 'Hotel',
      venueSetting: existingListing?.details?.venueSetting || 'City',
      indoorOutdoor: existingListing?.details?.indoorOutdoor || 'Both',
      hasAirConditioning: existingListing?.details?.hasAirConditioning ?? true,
      parkingCapacity: existingListing?.details?.parkingCapacity || '50+',
      parkingType: existingListing?.details?.parkingType || 'On-site',
      valetParking: existingListing?.details?.valetParking || 'Included',
      hasBackupGenerator: existingListing?.details?.hasBackupGenerator ?? true,
      wifi: existingListing?.details?.wifi || 'Free',
      wheelchairAccessible: existingListing?.details?.wheelchairAccessible || 'Fully accessible',
      hasElevator: existingListing?.details?.hasElevator ?? true,
      hasGuestDropOff: existingListing?.details?.hasGuestDropOff ?? true,
      hasVendorLoadingAccess: existingListing?.details?.hasVendorLoadingAccess ?? true,

      // 3. Ceremony
      hasCeremony: existingListing?.details?.hasCeremony ?? true,
      ceremonyLocation: existingListing?.details?.ceremonyLocation || 'Garden',
      separateCeremonyReceptionSpaces: existingListing?.details?.separateCeremonyReceptionSpaces ?? true,
      outdoorCeremonyCapacity: existingListing?.details?.outdoorCeremonyCapacity || '200',

      // 4. Catering & Dining
      hasCatering: existingListing?.details?.hasCatering ?? true,
      cateringProvidedBy: existingListing?.details?.cateringProvidedBy || 'Both',
      cuisineOptions: existingListing?.details?.cuisineOptions || ['Sri Lankan', 'Western', 'Indian'],
      buffetAvailable: existingListing?.details?.buffetAvailable ?? true,
      platedDinnerAvailable: existingListing?.details?.platedDinnerAvailable ?? true,
      customMenuAvailable: existingListing?.details?.customMenuAvailable ?? true,
      outsideFoodAllowed: existingListing?.details?.outsideFoodAllowed || 'With additional fee',
      cakeCuttingAllowed: existingListing?.details?.cakeCuttingAllowed ?? true,
      kitchenFacility: existingListing?.details?.kitchenFacility || 'Available',

      // 5. Beverages
      hasBeverages: existingListing?.details?.hasBeverages ?? true,
      beverageService: existingListing?.details?.beverageService || 'Both',
      barFacility: existingListing?.details?.barFacility || 'Full bar',
      outsideBeveragesAllowed: existingListing?.details?.outsideBeveragesAllowed || 'Corkage fee applies',

      // 6. Accommodation
      hasAccommodation: existingListing?.details?.hasAccommodation ?? true,
      numberOfGuestRooms: existingListing?.details?.numberOfGuestRooms || '26–50',
      roomTypes: existingListing?.details?.roomTypes || ['Deluxe', 'Suite'],
      bridalSuiteAvailable: existingListing?.details?.bridalSuiteAvailable ?? true,
      complimentaryBridalSuite: existingListing?.details?.complimentaryBridalSuite || 'Included',
      guestAccommodationAvailable: existingListing?.details?.guestAccommodationAvailable ?? true,
      onSiteAccommodation: existingListing?.details?.onSiteAccommodation ?? true,

      // 7. Entertainment & Event Facilities
      hasEntertainment: existingListing?.details?.hasEntertainment ?? true,
      djAllowed: existingListing?.details?.djAllowed || 'Yes',
      liveBandAllowed: existingListing?.details?.liveBandAllowed || 'Yes',
      traditionalMusicAllowed: existingListing?.details?.traditionalMusicAllowed ?? true,
      maxMusicEndTime: existingListing?.details?.maxMusicEndTime || 'Midnight',
      projectorScreen: existingListing?.details?.projectorScreen || 'Included',

      // 8. Decoration
      hasDecoration: existingListing?.details?.hasDecoration ?? true,
      decorationPolicy: existingListing?.details?.decorationPolicy || 'Both',
      basicDecorationIncluded: existingListing?.details?.basicDecorationIncluded ?? true,
      floralDecorationAvailable: existingListing?.details?.floralDecorationAvailable ?? true,
      stageDecorationAvailable: existingListing?.details?.stageDecorationAvailable ?? true,
      tableDecoration: existingListing?.details?.tableDecoration || 'Included',
      lightingDecoration: existingListing?.details?.lightingDecoration || 'Included',
      outsideDecoratorAllowed: existingListing?.details?.outsideDecoratorAllowed || 'With approval',

      // 9. Photography (Hotel Policy)
      hasPhotographyPolicy: existingListing?.details?.hasPhotographyPolicy ?? true,
      photographyAllowed: existingListing?.details?.photographyAllowed ?? true,
      externalPhotographerAllowed: existingListing?.details?.externalPhotographerAllowed || 'Yes',
      preWeddingShootAllowed: existingListing?.details?.preWeddingShootAllowed || 'Yes',
      photographyLocations: existingListing?.details?.photographyLocations || ['Garden', 'Ballroom', 'Lobby', 'Exterior'],

      // 10. Policies
      hasPolicies: existingListing?.details?.hasPolicies ?? true,
      cancellationPolicy:
        existingListing?.details?.cancellationPolicy ||
        'Cancellations made 60 days prior receive a 75% refund. Within 30 days, deposit is non-refundable.',
      depositRequired: existingListing?.details?.depositRequired ?? true,
      depositAmount: existingListing?.details?.depositAmount || '25% advance to secure date',
      minimumGuestCount: existingListing?.details?.minimumGuestCount || '100',
      minimumBookingDuration: existingListing?.details?.minimumBookingDuration || '6 hours',
      additionalCharges:
        existingListing?.details?.additionalCharges ||
        'Generator fuel surcharge applies after 6 hours of continuous usage.',
      outsideVendorRestrictions:
        existingListing?.details?.outsideVendorRestrictions ||
        'All external decorators and sound crews must submit equipment specs 14 days prior.',

      // Photography Defaults
      shootingStyle: existingListing?.details?.shootingStyle || 'Candid / Documentary',
      hoursOfCoverage: existingListing?.details?.hoursOfCoverage || 'Full Day (10–12 Hours)',
      includedServices: existingListing?.details?.includedServices || [
        'Full Day Wedding Coverage',
        'Pre-Wedding / Engagement Shoot',
        'High-Res Digital Gallery',
      ],
      photosDelivered: existingListing?.details?.photosDelivered || '500+ Fully Edited',
      deliveryTimeframe: existingListing?.details?.deliveryTimeframe || '3–4 Weeks',
      rawFilesIncluded: existingListing?.details?.rawFilesIncluded ?? false,
      digitalGalleryIncluded: existingListing?.details?.digitalGalleryIncluded ?? true,
      albumIncluded: existingListing?.details?.albumIncluded ?? true,
      albumType: existingListing?.details?.albumType || 'Leather Flush Mount (12x18)',
      albumPages: existingListing?.details?.albumPages || '50 Pages / 25 Spreads',
      photographerCount: existingListing?.details?.photographerCount || '2 Photographers',
      droneAllowed: existingListing?.details?.droneAllowed ?? true,
      backupGear: existingListing?.details?.backupGear ?? true,
      videographyIncluded: existingListing?.details?.videographyIncluded ?? false,
      videographerCount: existingListing?.details?.videographerCount || '2 Videographers',
      videoLength: existingListing?.details?.videoLength || '3–5 Min Cinematic Teaser + 30 Min Feature',
      videoDeliverables: existingListing?.details?.videoDeliverables || [
        'Cinematic 4K Teaser (3-5 mins)',
        'Full Ceremony & Poruwa Edit',
      ],
      travelOutsideColombo: existingListing?.details?.travelOutsideColombo || 'Yes - Additional Fee',
      outstationAccommodationRequired: existingListing?.details?.outstationAccommodationRequired ?? true,

      // Music Defaults
      performanceType: existingListing?.details?.performanceType || 'Live Band',
      lineupSize: existingListing?.details?.lineupSize || '6–8 Piece Full Band',
      setDuration: existingListing?.details?.setDuration || '5 Hours (Standard Reception)',
      genres: existingListing?.details?.genres || [
        'Pop & Top 40',
        'Sri Lankan Baila',
        'Classic Rock & Retro (70s/80s)',
      ],
      soundSystemIncluded: existingListing?.details?.soundSystemIncluded ?? true,
      soundSystemCapacity: existingListing?.details?.soundSystemCapacity || 'Medium Hall (150–350 Guests)',
      wirelessMics: existingListing?.details?.wirelessMics || '2 Wireless Handheld Mics',
      stageLightingIncluded: existingListing?.details?.stageLightingIncluded ?? true,
      lightingRig: existingListing?.details?.lightingRig || 'Moving Heads & Truss Lighting',
      setupTimeRequired: existingListing?.details?.setupTimeRequired || '2 Hours Prior',
      backupHardwareOnSite: existingListing?.details?.backupHardwareOnSite ?? true,
      mcServicesIncluded: existingListing?.details?.mcServicesIncluded ?? true,
      breakMusicIncluded: existingListing?.details?.breakMusicIncluded ?? true,
      customSongsAllowed: existingListing?.details?.customSongsAllowed || 'Up to 3 Rehearsed Songs',
      overtimeRate: existingListing?.details?.overtimeRate || 'Rs. 25,000 / Hour',

      // Decorations Defaults
      primaryStyles: existingListing?.details?.primaryStyles || [
        'Classic / Traditional',
        'Glamorous / Luxury Floral',
        'Modern / Minimalist',
      ],
      providesFlorals: existingListing?.details?.providesFlorals ?? true,
      floralTypes: existingListing?.details?.floralTypes || [
        'Fresh Local Seasonal Flowers',
        'Premium Imported Blooms (Roses, Hydrangeas, Orchids)',
      ],
      availableSetups: existingListing?.details?.availableSetups || [
        'Poruwa / Mandap / Ceremony Arch',
        'Head Table & Settee Backdrop',
        'Guest Table Centerpieces & Runners',
        'Entrance Archway & Welcome Canopy',
      ],
      tablewareLinens: existingListing?.details?.tablewareLinens || 'Full Linens & Chair Covers Included',
      customSignageIncluded: existingListing?.details?.customSignageIncluded ?? true,
      loungePropsAvailable: existingListing?.details?.loungePropsAvailable ?? true,
      sameDayTeardownIncluded: existingListing?.details?.sameDayTeardownIncluded ?? true,
      venueRestrictions: existingListing?.details?.venueRestrictions || 'Works at Any Client Venue',
      outstationDecorAllowed: existingListing?.details?.outstationDecorAllowed ?? true,
      travelFeePolicy: existingListing?.details?.travelFeePolicy || 'Additional Fee Based on Mileage / Distance',
      freeConsultation: existingListing?.details?.freeConsultation ?? true,
      customMoodboards: existingListing?.details?.customMoodboards ?? true,
      designFeePolicy: existingListing?.details?.designFeePolicy || 'Complimentary with Confirmed Booking',
      minimumBudget: existingListing?.details?.minimumBudget || 'Rs. 250,000',

      // Catering Defaults
      serviceStyle: existingListing?.details?.serviceStyle || 'Buffet Service',
      cuisines: existingListing?.details?.cuisines || [
        'Sri Lankan Traditional & Village',
        'Western Fine Dining & Continental',
        'Indian / Mughlai / Tandoori',
      ],
      dietaryOptions: existingListing?.details?.dietaryOptions || [
        'Vegetarian',
        '100% Halal Certified',
        'Vegan',
      ],
      minGuests: existingListing?.details?.minGuests || 50,
      maxGuests: existingListing?.details?.maxGuests || 1000,
      pricePerHead: existingListing?.details?.pricePerHead || 'Rs. 3,800 / Plate',
      waitstaffIncluded: existingListing?.details?.waitstaffIncluded ?? true,
      glasswareIncluded: existingListing?.details?.glasswareIncluded ?? true,
      crockeryCutlery: existingListing?.details?.crockeryCutlery || 'Premium Porcelain & Stainless Silverware',
      chafingDishesIncluded: existingListing?.details?.chafingDishesIncluded ?? true,
      furnitureRentalAvailable: existingListing?.details?.furnitureRentalAvailable ?? false,
      setupTeardownIncluded: existingListing?.details?.setupTeardownIncluded ?? true,
      outstationCatering: existingListing?.details?.outstationCatering || 'Islandwide with Transport Surcharge',
      kitchenRequirement: existingListing?.details?.kitchenRequirement || 'Full On-Site Venue Kitchen Needed',
      tastingAvailable: existingListing?.details?.tastingAvailable ?? true,
      tastingPolicy: existingListing?.details?.tastingPolicy || 'Complimentary for Couple (2 Pax)',
    },
  };
}

export default function CreateListingPage({ onNavigate }) {
  // ── File input reference for local media upload ──
  const fileInputRef = useRef(null);

  // ── Extract edit ID from URL search params ──
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const editId = searchParams.get('id');
  const isEditMode = Boolean(editId);

  // ── Current Step state ──
  const [currentStep, setCurrentStep] = useState(1);

  // ── Validation Errors State ──
  const [errors, setErrors] = useState({});

  // ── Form State ──
  const [formData, setFormData] = useState(() => buildInitialFormData());
  const [existingListing, setExistingListing] = useState(null);
  const [isLoadingListing, setIsLoadingListing] = useState(Boolean(editId));

  useEffect(() => {
    if (!editId) return;
    const token = localStorage.getItem('token');
    setIsLoadingListing(true);
    fetch(`${API_BASE}/services/${editId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Listing not found');
        return res.json();
      })
      .then((data) => {
        setExistingListing(data);
        setFormData(buildInitialFormData(data));
      })
      .catch((err) => {
        console.error('Failed to load listing for edit:', err);
      })
      .finally(() => {
        setIsLoadingListing(false);
      });
  }, [editId]);

  // Track draft save feedback
  const [saveBanner, setSaveBanner] = useState(null);

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleDetailChange = (detailField, value) => {
    setFormData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [detailField]: value,
      },
    }));
    clearError(detailField);
  };

  // ── Media Handlers (Real Backend Upload & Storage) ──
  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = files.map((file, idx) => ({
      id: `img-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      url: URL.createObjectURL(file),
      file,
      isCover: (formData.images || []).length === 0 && idx === 0,
    }));

    setFormData((prev) => {
      const combined = [...(prev.images || []), ...newImages];
      if (combined.length > 0 && !combined.some((img) => img.isCover)) {
        combined[0].isCover = true;
      }
      return { ...prev, images: combined };
    });
    clearError('images');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSampleImages = () => {
    setFormData((prev) => {
      const existing = prev.images || [];
      const updated = [...existing];
      SAMPLE_PRESET_IMAGES.forEach((sample) => {
        if (!updated.some((item) => item.name === sample.name)) {
          updated.push({
            ...sample,
            id: `sample-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            isCover: updated.length === 0,
          });
        }
      });
      if (updated.length > 0 && !updated.some((i) => i.isCover)) {
        updated[0].isCover = true;
      }
      return { ...prev, images: updated };
    });
    clearError('images');
  };

  const handleSetCoverImage = (imgId) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).map((img) => ({
        ...img,
        isCover: img.id === imgId,
      })),
    }));
  };

  const handleRemoveImage = async (imgId) => {
    const target = (formData.images || []).find((img) => img.id === imgId);
    if (target?.imageId && editId) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/services/${editId}/images/${target.imageId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
      } catch (err) {
        console.warn('Failed to delete image from server:', err);
      }
    }

    setFormData((prev) => {
      const filtered = (prev.images || []).filter((img) => img.id !== imgId);
      if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
        filtered[0].isCover = true;
      }
      return { ...prev, images: filtered };
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title?.trim()) {
        newErrors.title = 'Listing title is required.';
      } else if (formData.title.trim().length < 5) {
        newErrors.title = 'Title must be at least 5 characters long.';
      }

      if (!formData.category) {
        newErrors.category = 'Please select a listing category.';
      }

      if (!formData.priceOnRequest) {
        if (formData.price === '' || formData.price === null || formData.price === undefined) {
          newErrors.price = 'Starting price is required (or enable "Price on Request").';
        } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
          newErrors.price = 'Starting price must be a valid number greater than 0.';
        }
      }

      if (!formData.description?.trim()) {
        newErrors.description = 'Short description is required for listing cards.';
      }

      if (!formData.fullDescription?.trim()) {
        newErrors.fullDescription = 'Full detailed description is required for the detail page.';
      }
    }

    if (step === 2) {
      if (formData.category === 'Hotel / Venue') {
        const spaces = formData.details?.spaces || [];
        if (spaces.length === 0) {
          newErrors.spaces = 'At least one venue space/hall is required.';
        } else {
          const hasEmptyName = spaces.some((s) => !s.name?.trim());
          if (hasEmptyName) {
            newErrors.spaces = 'All venue spaces must have a space/hall name.';
          } else {
            const hasInvalidCapacity = spaces.some(
              (s) => !s.capacitySeated || Number(s.capacitySeated) <= 0
            );
            if (hasInvalidCapacity) {
              newErrors.spaces = 'Each space must have a seated guest capacity greater than 0.';
            }
          }
        }
      }
    }

    if (step === 3) {
      const images = formData.images || [];
      if (images.length === 0) {
        newErrors.images = 'Please upload or select at least 1 image for your listing.';
      }
    }

    return newErrors;
  };

  const uploadPendingImages = async (serviceId, token) => {
    const imagesToUpload = (formData.images || []).filter((img) => img.file);
    for (const img of imagesToUpload) {
      try {
        const data = new FormData();
        data.append('file', img.file);
        data.append('isCover', Boolean(img.isCover));
        const res = await fetch(`${API_BASE}/services/${serviceId}/images`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: data
        });
        if (res.ok) {
          const uploaded = await res.json();
          img.imageId = uploaded.imageId;
          img.url = `http://localhost:5131${uploaded.imageUrl}`;
          delete img.file;
        }
      } catch (uploadErr) {
        console.warn('Image upload error:', uploadErr);
      }
    }
  };

  const handleSaveDraft = async () => {
    const token = localStorage.getItem('token');
    const isNumericId = Boolean(editId && !isNaN(Number(editId)));
    const method = isNumericId ? 'PUT' : 'POST';
    const url = isNumericId ? `${API_BASE}/services/${editId}` : `${API_BASE}/services`;

    const formattedSpaces = (formData.category === 'Hotel / Venue' ? (formData.details?.spaces || []) : []).map((sp) => ({
      spaceId: sp.spaceId ? Number(sp.spaceId) : (typeof sp.id === 'number' ? sp.id : (String(sp.id).startsWith('space-') && !isNaN(Number(String(sp.id).replace('space-', ''))) ? Number(String(sp.id).replace('space-', '')) : null)),
      name: sp.name?.trim() || '',
      type: sp.type || 'Indoor Ballroom',
      capacitySeated: sp.capacitySeated ? Number(sp.capacitySeated) : null,
      capacityFloating: sp.capacityFloating ? Number(sp.capacityFloating) : null,
      isAirConditioned: sp.isAirConditioned ?? true,
      description: sp.description || ''
    }));

    const chosenCover = (formData.images || []).find((img) => img.isCover);
    const coverImageUrl = chosenCover?.url?.startsWith('http://localhost:5131')
      ? chosenCover.url.replace('http://localhost:5131', '')
      : (chosenCover && !chosenCover.file && !chosenCover.url?.startsWith('blob:') ? chosenCover.url : null);

    const payload = {
      title: formData.title.trim() || 'Untitled Listing (Draft)',
      category: formData.category,
      price: formData.priceOnRequest ? null : (formData.price !== '' && formData.price !== null ? Number(formData.price) : null),
      priceOnRequest: Boolean(formData.priceOnRequest),
      description: formData.description.trim() || 'Draft listing',
      fullDescription: formData.fullDescription?.trim() || formData.description.trim(),
      status: 'Draft',
      coverImageUrl,
      spaces: formattedSpaces,
      details: {
        ...formData.details,
        spaces: formattedSpaces
      }
    };

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save draft');
      }

      const saved = await res.json();
      const targetServiceId = saved.serviceId || editId;
      if (targetServiceId) {
        await uploadPendingImages(targetServiceId, token);
      }

      setSaveBanner('Draft saved successfully! Redirecting to My Listings...');
      setTimeout(() => {
        onNavigate?.('vendor-services');
      }, 700);
    } catch (err) {
      console.error('Save draft error:', err);
      setSaveBanner(`Save failed: ${err.message}`);
      setTimeout(() => setSaveBanner(null), 4000);
    }
  };

  const handleNextStep = async () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }
    setErrors({});

    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final submit - save to backend
      const isNumericId = Boolean(editId && !isNaN(Number(editId)));
      const method = isNumericId ? 'PUT' : 'POST';
      const url = isNumericId ? `${API_BASE}/services/${editId}` : `${API_BASE}/services`;

      const formattedSpaces = (formData.category === 'Hotel / Venue' ? (formData.details?.spaces || []) : []).map((sp) => ({
        spaceId: sp.spaceId ? Number(sp.spaceId) : (typeof sp.id === 'number' ? sp.id : (String(sp.id).startsWith('space-') && !isNaN(Number(String(sp.id).replace('space-', ''))) ? Number(String(sp.id).replace('space-', '')) : null)),
        name: sp.name?.trim() || '',
        type: sp.type || 'Indoor Ballroom',
        capacitySeated: sp.capacitySeated ? Number(sp.capacitySeated) : null,
        capacityFloating: sp.capacityFloating ? Number(sp.capacityFloating) : null,
        isAirConditioned: sp.isAirConditioned ?? true,
        description: sp.description || ''
      }));

      const chosenCover = (formData.images || []).find((img) => img.isCover);
      const coverImageUrl = chosenCover?.url?.startsWith('http://localhost:5131')
        ? chosenCover.url.replace('http://localhost:5131', '')
        : (chosenCover && !chosenCover.file && !chosenCover.url?.startsWith('blob:') ? chosenCover.url : null);

      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        price: formData.priceOnRequest ? null : (formData.price !== '' && formData.price !== null ? Number(formData.price) : null),
        priceOnRequest: Boolean(formData.priceOnRequest),
        description: formData.description.trim(),
        fullDescription: formData.fullDescription?.trim() || formData.description.trim(),
        status: formData.status || 'Active',
        coverImageUrl,
        spaces: formattedSpaces,
        details: {
          ...formData.details,
          spaces: formattedSpaces
        }
      };

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to save listing');
        }

        const saved = await res.json();
        const targetServiceId = saved.serviceId || editId;
        if (targetServiceId) {
          await uploadPendingImages(targetServiceId, token);
        }

        setSaveBanner(isEditMode ? 'Listing changes saved successfully! Redirecting...' : 'Listing published successfully! Redirecting...');
        setTimeout(() => {
          onNavigate?.('vendor-services');
        }, 700);
      } catch (err) {
        console.error('Submit listing error:', err);
        setSaveBanner(`Save failed: ${err.message}`);
      }
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId < currentStep) {
      // Navigating back is always allowed
      setErrors({});
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (stepId > currentStep) {
      // Validate current step before advancing via tracker clicks
      const stepErrors = validateStep(currentStep);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      }
      setErrors({});
      setCurrentStep(stepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-24">

      {/* ── Top Bar: Back, Title, Status ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F1E5EC] pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="wizard-back-btn"
            onClick={() => onNavigate?.('vendor-services')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8DDE4] bg-white text-[#737373] hover:text-[#1E293B] hover:border-[#8E406F] hover:bg-[#FDF0F4] transition shadow-sm"
            aria-label="Back to listings"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8E406F]">
                Vendor Portal
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-[#737373]">
                {isEditMode ? 'Edit Existing Listing' : 'Listing Wizard'}
              </span>
              <Badge variant={isEditMode ? 'active' : 'new'} size="xs">
                {isEditMode ? 'Editing Mode' : 'New Listing'}
              </Badge>
            </div>
            <h1
              className="text-2xl font-bold text-[#1E293B] mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {isEditMode ? `Edit: ${formData.title || 'Untitled'}` : 'Create New Listing'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="wizard-save-draft-btn"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8DDE4] bg-white px-4 py-2 text-xs font-semibold text-[#555] shadow-sm hover:border-[#8E406F] hover:bg-slate-50 transition"
          >
            <Save size={14} className="text-[#8E406F]" />
            Save as Draft
          </button>
          <button
            type="button"
            id="wizard-exit-btn"
            onClick={() => onNavigate?.('vendor-services')}
            className="rounded-xl px-3 py-2 text-xs font-medium text-[#737373] hover:text-[#1E293B] transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ── Feedback Notification ── */}
      {saveBanner && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-semibold text-emerald-800 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* ── Multi-Step Progress Tracker ── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((step) => {
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id)}
                className={`flex items-start gap-3 text-left p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-[#FDF0F4] border border-[#F1E5EC]'
                    : isDone
                    ? 'hover:bg-slate-50 cursor-pointer'
                    : 'opacity-60 cursor-pointer hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-[#8E406F] text-white shadow-sm ring-2 ring-[#8E406F]/20'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isDone ? <Check size={14} strokeWidth={3} /> : step.id}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate leading-tight ${
                      isCurrent ? 'text-[#8E406F]' : isDone ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-[#737373] truncate mt-0.5 hidden sm:block">
                    {step.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Wizard Content Area ── */}
      <div className="rounded-2xl border border-[#F1E5EC] bg-white p-6 shadow-sm min-h-[420px]">

        {/* ════════════════════════════════════════════════════════════════════
            STEP 1: Basic Information & Category Selection
           ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2
                className="text-lg font-bold text-[#1E293B]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                1. Select Category & Core Details
              </h2>
              <p className="text-xs text-[#737373] mt-0.5">
                Choose the service category you are listing and provide a primary title and starting rate.
              </p>
            </div>

            {/* Error Notification banner if any errors on step */}
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-800 animate-fadeIn">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>Please complete the required fields highlighted below before continuing.</span>
              </div>
            )}

            {/* Category Cards Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1E293B]">
                Listing Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {LISTING_CATEGORIES.map((cat) => {
                  const meta = CATEGORY_META[cat] || {
                    icon: Layers,
                    desc: 'Professional wedding service package',
                  };
                  const CatIcon = meta.icon;
                  const isSelected = formData.category === cat;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleFieldChange('category', cat)}
                      className={`flex items-start gap-3 p-3.5 text-left rounded-xl border transition-all duration-150 ${
                        isSelected
                          ? 'border-[#8E406F] bg-[#FDF0F4] shadow-sm ring-1 ring-[#8E406F]/20'
                          : 'border-[#E8DDE4] bg-white hover:border-[#8E406F]/40 hover:bg-slate-50/70'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-[#8E406F] text-white' : 'bg-[#FDF0F4] text-[#8E406F]'
                        }`}
                      >
                        <CatIcon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold ${
                              isSelected ? 'text-[#8E406F]' : 'text-[#1E293B]'
                            }`}
                          >
                            {cat}
                          </p>
                          {isSelected && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#8E406F] text-white">
                              <Check size={10} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#737373] line-clamp-2 mt-0.5 leading-snug">
                          {meta.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Listing Title */}
            <FormField
              id="listing-title"
              label="Listing Title"
              required
              hint="Be descriptive and memorable (max 80 chars)"
              error={errors.title}
            >
              <input
                id="listing-title"
                type="text"
                maxLength={80}
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="e.g. The Grand Sapphire Ballroom & Scenic Gardens"
                className={`${inputCls} ${errors.title ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : ''}`}
              />
            </FormField>

            {/* Price section with Price on Request toggle — visually balanced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <FormField
                id="listing-price"
                label="Starting Price (LKR)"
                required={!formData.priceOnRequest}
                hint={formData.priceOnRequest ? 'Price will show as "Price on request"' : 'Approx. starting rate'}
                error={errors.price}
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    Rs.
                  </span>
                  <input
                    id="listing-price"
                    type="number"
                    min="0"
                    disabled={formData.priceOnRequest}
                    value={formData.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    placeholder={formData.priceOnRequest ? 'Price on request' : 'e.g. 150000'}
                    className={`${inputCls} pl-9 ${formData.priceOnRequest ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''} ${errors.price ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : ''}`}
                  />
                </div>
              </FormField>

              <div className="flex flex-col gap-1.5">
                <Toggle
                  id="toggle-price-on-request"
                  fieldLabel="Pricing Display Option"
                  label="Price on Request"
                  description="Hide numeric price; direct quotes only"
                  checked={formData.priceOnRequest}
                  onChange={(val) => {
                    handleFieldChange('priceOnRequest', val);
                    if (val) {
                      handleFieldChange('price', '');
                    }
                  }}
                  size="sm"
                />
                <span className="text-[11px] text-[#94A3B8]">
                  {formData.priceOnRequest
                    ? 'Enabled — public rate is hidden from search'
                    : 'Disabled — numeric starting rate is displayed'}
                </span>
              </div>
            </div>

            {/* Short Description (shown on listing cards) */}
            <FormField
              id="listing-summary"
              label="Short Description (Shown on Listing Cards)"
              required
              hint={`${formData.description?.length || 0}/200 characters • Directory snippet`}
              error={errors.description}
            >
              <textarea
                id="listing-summary"
                rows={2}
                maxLength={200}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="A concise 1–2 sentence overview for directory cards and search previews..."
                className={`${inputCls} resize-none ${errors.description ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : ''}`}
              />
            </FormField>

            {/* Full Description (shown on the full listing detail page) */}
            <FormField
              id="listing-full-description"
              label="Full Description (Shown on Listing Detail Page)"
              required
              hint="In-depth package story, amenities & policies"
              error={errors.fullDescription}
            >
              <textarea
                id="listing-full-description"
                rows={5}
                value={formData.fullDescription}
                onChange={(e) => handleFieldChange('fullDescription', e.target.value)}
                placeholder="Provide an extensive description of your venue or service. Detail package inclusions, setup times, customization options, booking terms, and unique highlights that couples will read on your full listing profile..."
                className={`${inputCls} resize-y min-h-[110px] ${errors.fullDescription ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15' : ''}`}
              />
            </FormField>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 2: Category Details & Spaces (Turn 1 Highlight)
           ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="venue" size="xs">
                  {formData.category}
                </Badge>
                <span className="text-xs text-[#737373]">Step 2 of 4</span>
              </div>
              <h2
                className="text-lg font-bold text-[#1E293B]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                2. {formData.category} Specifications & Details
              </h2>
              <p className="text-xs text-[#737373]">
                Configure detailed specifications, inclusions, and service parameters for your {formData.category} listing.
              </p>
            </div>

            {/* 1. Hotel / Venue */}
            {formData.category === 'Hotel / Venue' && (
              <HotelVenueDetails
                details={formData.details}
                onChange={(newDetails) => {
                  setFormData((prev) => ({ ...prev, details: newDetails }));
                  clearError('spaces');
                }}
                spacesError={errors.spaces}
              />
            )}

            {/* 2. Photography */}
            {formData.category === 'Photography' && (
              <PhotographyDetails
                details={formData.details}
                onChange={(newDetails) => {
                  setFormData((prev) => ({ ...prev, details: newDetails }));
                }}
              />
            )}

            {/* 3. Music */}
            {formData.category === 'Music' && (
              <MusicDetails
                details={formData.details}
                onChange={(newDetails) => {
                  setFormData((prev) => ({ ...prev, details: newDetails }));
                }}
              />
            )}

            {/* 4. Decorations */}
            {formData.category === 'Decorations' && (
              <DecorationsDetails
                details={formData.details}
                onChange={(newDetails) => {
                  setFormData((prev) => ({ ...prev, details: newDetails }));
                }}
              />
            )}

            {/* 5. Catering */}
            {formData.category === 'Catering' && (
              <CateringDetails
                details={formData.details}
                onChange={(newDetails) => {
                  setFormData((prev) => ({ ...prev, details: newDetails }));
                }}
              />
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 3: Photos & Gallery Media
           ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="venue" size="xs">
                  {formData.category}
                </Badge>
                <span className="text-xs text-[#737373]">Step 3 of 4</span>
              </div>
              <h2
                className="text-lg font-bold text-[#1E293B]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                3. Photos & Gallery Media
              </h2>
              <p className="text-xs text-[#737373]">
                Upload high-resolution photography showcasing your services, venues, setup styles, and portfolio work.
              </p>
            </div>

            {/* Validation error if attempted to continue with 0 images */}
            {errors.images && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-semibold text-rose-800 animate-fadeIn">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errors.images}</span>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp, image/jpg"
              onChange={handleFilesSelected}
              className="hidden"
              id="listing-file-upload-input"
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesSelected({ target: { files: e.dataTransfer.files } });
              }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#E8DDE4] bg-slate-50/60 p-8 sm:p-10 text-center hover:bg-[#FDF0F4]/30 hover:border-[#8E406F]/40 transition"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF0F4] text-[#8E406F] mb-3 shadow-xs">
                <UploadCloud size={24} />
              </div>
              <h4 className="text-sm font-bold text-[#1E293B] mb-1">
                Upload Listing Cover & Gallery Photos
              </h4>
              <p className="text-xs text-[#737373] max-w-md mb-4 leading-relaxed">
                Drag & drop image files (PNG, JPG, WebP) here, or browse local files. First photo defaults to Cover Photo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  id="btn-browse-images"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#8E406F] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#73325A] active:scale-95 transition cursor-pointer"
                >
                  <Plus size={14} />
                  Browse Image Files
                </button>
                <button
                  type="button"
                  id="btn-use-sample-images"
                  onClick={handleAddSampleImages}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8DDE4] bg-white px-4 py-2 text-xs font-semibold text-[#1E293B] shadow-sm hover:border-[#8E406F] hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                >
                  <Sparkles size={14} className="text-[#8E406F]" />
                  Use Sample Wedding Photos
                </button>
              </div>
            </div>

            {/* Selected Images Grid Preview */}
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E293B]">
                    Selected Photos ({formData.images.length})
                  </span>
                  <span className="text-[11px] text-[#737373]">
                    Click star to designate primary cover photo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.images.map((img) => (
                    <div
                      key={img.id}
                      className={`group relative overflow-hidden rounded-xl border bg-white shadow-xs transition ${
                        img.isCover
                          ? 'border-[#8E406F] ring-2 ring-[#8E406F]/20'
                          : 'border-[#E8DDE4] hover:border-slate-300'
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        <img
                          src={img.url}
                          alt={img.name || 'Listing image'}
                          className="h-full w-full object-cover transition duration-200 group-hover:scale-102"
                        />
                        {img.isCover && (
                          <div className="absolute top-2 left-2 rounded-lg bg-[#8E406F] px-2 py-1 text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                            <Star size={10} fill="white" />
                            Cover Photo
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          {!img.isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(img.id)}
                              title="Set as Cover Photo"
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 backdrop-blur-xs text-slate-600 hover:text-[#8E406F] hover:bg-white shadow-xs transition cursor-pointer"
                            >
                              <Star size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(img.id)}
                            title="Remove Photo"
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 backdrop-blur-xs text-slate-600 hover:text-rose-600 hover:bg-white shadow-xs transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="p-2.5 flex items-center justify-between text-xs">
                        <span className="truncate font-medium text-slate-700 max-w-[170px]" title={img.name}>
                          {img.name || 'Uploaded photo'}
                        </span>
                        {img.size && (
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {img.size}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            STEP 4: Review & Publish (All 5 Categories Supported)
           ════════════════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="venue" size="xs">
                  {formData.category}
                </Badge>
                <span className="text-xs text-[#737373]">Step 4 of 4</span>
              </div>
              <h2
                className="text-lg font-bold text-[#1E293B]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                4. Review Listing & Publish
              </h2>
              <p className="text-xs text-[#737373]">
                Verify all listing parameters, descriptions, gallery media, and category-specific parameters before publishing.
              </p>
            </div>

            <div className="rounded-2xl border border-[#F1E5EC] bg-[#FCF8FA] p-5 sm:p-6 space-y-6">
              {/* Header: Title, Category, and Rate */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#F1E5EC] pb-4">
                <div>
                  <Badge variant="venue" size="sm" className="mb-2">
                    {formData.category}
                  </Badge>
                  <h3
                    className="text-lg font-bold text-[#1E293B]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {formData.title || 'Untitled Listing'}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#737373]">Starting Rate</p>
                  <p className="text-lg font-bold text-[#8E406F]">
                    {formData.priceOnRequest
                      ? 'Price on Request'
                      : formData.price
                      ? `Rs. ${Number(formData.price).toLocaleString('en-LK')}`
                      : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Photos Preview Strip */}
              {formData.images && formData.images.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Gallery & Cover Photography ({formData.images.length})
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto pb-2">
                    {formData.images.map((img) => (
                      <div
                        key={img.id}
                        className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border bg-slate-100 ${
                          img.isCover ? 'border-[#8E406F] ring-2 ring-[#8E406F]/20' : 'border-[#E8DDE4]'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.name || 'Preview'}
                          className="h-full w-full object-cover"
                        />
                        {img.isCover && (
                          <span className="absolute bottom-1 left-1 rounded bg-[#8E406F] px-1 py-0.5 text-[9px] font-bold text-white">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Short Description (Directory Cards)
                  </span>
                  <p className="text-xs text-[#475569] bg-white p-3 rounded-xl border border-[#E8DDE4] min-h-[70px]">
                    {formData.description || 'No short summary provided.'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Full Detailed Story (Detail Profile Page)
                  </span>
                  <p className="text-xs text-[#475569] bg-white p-3 rounded-xl border border-[#E8DDE4] min-h-[70px] whitespace-pre-line">
                    {formData.fullDescription || 'No detailed package overview provided.'}
                  </p>
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────────
                  CATEGORY 1: Hotel / Venue Review Summary
                 ─────────────────────────────────────────────────────────── */}
              {formData.category === 'Hotel / Venue' && (
                <div className="pt-4 border-t border-[#F1E5EC] space-y-4">
                  {/* Top-Level Specs Summary */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Venue Specifications & Attributes
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Type</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.venueType || 'Hotel'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Setting</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.venueSetting || 'City'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Environment</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.indoorOutdoor || 'Both'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Parking</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.parkingCapacity || '50+'} ({formData.details.parkingType || 'On-site'})</span>
                      </div>
                    </div>
                  </div>

                  {/* Configured Event Spaces */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Configured Event Spaces ({formData.details.spaces?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {formData.details.spaces?.map((sp, idx) => (
                        <div
                          key={sp.id || idx}
                          className="rounded-xl border border-[#E8DDE4] bg-white p-3 text-xs shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1E293B]">{sp.name || 'Unnamed Space'}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              {sp.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373] mt-1">
                            Seated: {sp.capacitySeated || 0} • Floating: {sp.capacityFloating || 0}
                            {sp.isAirConditioned ? ' • Air Conditioned' : ''}
                          </p>
                          {sp.description && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                              "{sp.description}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature & Policy Gates Overview */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Enabled Services & Facilities
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.details.hasCeremony && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Ceremony Hosting ({formData.details.ceremonyLocation || 'On-site'})
                        </span>
                      )}
                      {formData.details.hasCatering && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Catering ({formData.details.cateringProvidedBy || 'In-House'})
                        </span>
                      )}
                      {formData.details.hasBeverages && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Beverages ({formData.details.barFacility || 'Bar Available'})
                        </span>
                      )}
                      {formData.details.hasAccommodation && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Accommodation ({formData.details.numberOfGuestRooms || 'Rooms Available'})
                        </span>
                      )}
                      {formData.details.hasEntertainment && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Music & Live Band (Cutoff: {formData.details.maxMusicEndTime || 'Midnight'})
                        </span>
                      )}
                      {formData.details.hasDecoration && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Decorations ({formData.details.decorationPolicy || 'In-House'})
                        </span>
                      )}
                      {formData.details.hasPhotographyPolicy && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Photography Permitted
                        </span>
                      )}
                      {formData.details.hasPolicies && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Booking Terms & Policies Defined
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────
                  CATEGORY 2: Photography Review Summary
                 ─────────────────────────────────────────────────────────── */}
              {formData.category === 'Photography' && (
                <div className="pt-4 border-t border-[#F1E5EC] space-y-4">
                  {/* Primary Shooting Specifications */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Photography Coverage Specifications
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Style</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.shootingStyle || 'Candid'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Coverage</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.hoursOfCoverage || 'Full Day'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Photos Delivered</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.photosDelivered || '500+'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Delivery Time</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.deliveryTimeframe || '3–4 Weeks'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Included Services & Deliverables */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Inclusions & Equipment Redundancy
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.details.includedServices?.map((srv) => (
                        <span key={srv} className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                          ✓ {srv}
                        </span>
                      ))}
                      {formData.details.digitalGalleryIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Digital Gallery
                        </span>
                      )}
                      {formData.details.rawFilesIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ RAW Files Provided
                        </span>
                      )}
                      {formData.details.droneAllowed && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Aerial Drone Portraits
                        </span>
                      )}
                      {formData.details.backupGear && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Dual-Camera Backup On-Site
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                        Crew: {formData.details.photographerCount || '2 Photographers'}
                      </span>
                    </div>
                  </div>

                  {/* Physical Album (if enabled) */}
                  {formData.details.albumIncluded && (
                    <div className="bg-white p-3 rounded-xl border border-[#E8DDE4] text-xs space-y-1">
                      <span className="font-bold text-[#1E293B] block">Included Wedding Album</span>
                      <p className="text-[#737373]">
                        Type: <span className="font-semibold text-slate-800">{formData.details.albumType || 'Flush Mount'}</span> • Spreads: <span className="font-semibold text-slate-800">{formData.details.albumPages || '50 Pages'}</span>
                      </p>
                    </div>
                  )}

                  {/* Videography Add-on (if enabled) */}
                  {formData.details.videographyIncluded && (
                    <div className="bg-white p-3 rounded-xl border border-[#E8DDE4] text-xs space-y-1">
                      <span className="font-bold text-[#1E293B] block">Videography Coverage Included</span>
                      <p className="text-[#737373]">
                        Team: <span className="font-semibold text-slate-800">{formData.details.videographerCount || '2 Videographers'}</span> • Output: <span className="font-semibold text-slate-800">{formData.details.videoLength || 'Cinematic Film'}</span>
                      </p>
                      {formData.details.videoDeliverables && formData.details.videoDeliverables.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formData.details.videoDeliverables.map((v) => (
                            <span key={v} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────
                  CATEGORY 3: Music Review Summary
                 ─────────────────────────────────────────────────────────── */}
              {formData.category === 'Music' && (
                <div className="pt-4 border-t border-[#F1E5EC] space-y-4">
                  {/* Lineup & Performance Specifications */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Performance & Lineup Specifications
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Performance Type</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.performanceType || 'Live Band'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Lineup Size</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.lineupSize || 'Full Band'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Set Duration</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.setDuration || '5 Hours'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Overtime Rate</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.overtimeRate || 'Rs. 25,000 / hr'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Repertoire / Genres */}
                  {formData.details.genres && formData.details.genres.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                        Repertoire & Music Genres
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {formData.details.genres.map((g) => (
                          <span key={g} className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                            🎵 {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sound & Production Facilities */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Sound, Lighting & Event Coordination
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.details.soundSystemIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ PA Sound System Included ({formData.details.soundSystemCapacity || 'Medium Hall'})
                        </span>
                      )}
                      {formData.details.stageLightingIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Stage Lighting Included ({formData.details.lightingRig || 'Truss Lighting'})
                        </span>
                      )}
                      {formData.details.backupHardwareOnSite && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Backup Amplification On-Site
                        </span>
                      )}
                      {formData.details.mcServicesIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ MC & Bilingual Announcements
                        </span>
                      )}
                      {formData.details.breakMusicIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Background Break Music
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                        Setup Time: {formData.details.setupTimeRequired || '2 Hours Prior'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────
                  CATEGORY 4: Decorations Review Summary
                 ─────────────────────────────────────────────────────────── */}
              {formData.category === 'Decorations' && (
                <div className="pt-4 border-t border-[#F1E5EC] space-y-4">
                  {/* Styling Aesthetics */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Design Styles & Themes
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.details.primaryStyles?.map((style) => (
                        <span key={style} className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                          ✨ {style}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Core Setups & Structures */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Core Setups & Inclusions
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.details.availableSetups?.map((setup) => (
                        <span key={setup} className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                          ✓ {setup}
                        </span>
                      ))}
                      {formData.details.customSignageIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Custom Welcome Signage
                        </span>
                      )}
                      {formData.details.loungePropsAvailable && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Lounge & Photo Props
                        </span>
                      )}
                      {formData.details.sameDayTeardownIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Same-Day Teardown
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Floral Arrangements (if enabled) */}
                  {formData.details.providesFlorals && (
                    <div className="bg-white p-3 rounded-xl border border-[#E8DDE4] text-xs space-y-1">
                      <span className="font-bold text-[#1E293B] block">Fresh Floral Styling</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {formData.details.floralTypes?.map((f) => (
                          <span key={f} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px] font-medium border border-rose-100">
                            🌸 {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consultation & Venue Terms */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Consultation & Venue Terms
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Venue Coverage</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.venueRestrictions || 'Any Client Venue'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Outstation Decor</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.outstationDecorAllowed ? 'Allowed' : 'Local Only'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Consultation</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.freeConsultation ? 'Complimentary' : 'Paid'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Minimum Budget</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.minimumBudget || 'Rs. 250,000'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ───────────────────────────────────────────────────────────
                  CATEGORY 5: Catering Review Summary
                 ─────────────────────────────────────────────────────────── */}
              {formData.category === 'Catering' && (
                <div className="pt-4 border-t border-[#F1E5EC] space-y-4">
                  {/* Service & Capacity Specifications */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Catering Service Specifications
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Service Style</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.serviceStyle || 'Buffet'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Guest Capacity</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.minGuests || 50} – {formData.details.maxGuests || 1000} Guests</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Rate / Plate</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.pricePerHead || 'Custom Quote'}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-[#E8DDE4] text-xs">
                        <span className="text-[10px] text-slate-400 block">Kitchen Requirement</span>
                        <span className="font-semibold text-[#1E293B]">{formData.details.kitchenRequirement || 'Full On-Site Kitchen'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuisines & Menus */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Cuisines & Dietary Accommodations
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.details.cuisines?.map((c) => (
                        <span key={c} className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                          🍽️ {c}
                        </span>
                      ))}
                      {formData.details.dietaryOptions?.map((d) => (
                        <span key={d} className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          🥗 {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tableware & Equipment */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Tableware & Staffing Inclusions
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {formData.details.waitstaffIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Professional Waitstaff Included
                        </span>
                      )}
                      {formData.details.glasswareIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Stemware & Glassware
                        </span>
                      )}
                      {formData.details.chafingDishesIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Chafing Dishes & Warmers
                        </span>
                      )}
                      {formData.details.setupTeardownIncluded && (
                        <span className="px-2.5 py-1 rounded-lg border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          ✓ Setup & Teardown
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg border font-medium bg-white text-slate-700 border-slate-200">
                        Cutlery: {formData.details.crockeryCutlery || 'Porcelain & Silverware'}
                      </span>
                    </div>
                  </div>

                  {/* Tasting Session (if available) */}
                  {formData.details.tastingAvailable && (
                    <div className="bg-white p-3 rounded-xl border border-[#E8DDE4] text-xs space-y-1">
                      <span className="font-bold text-[#1E293B] block">Menu Tasting Session</span>
                      <p className="text-[#737373]">
                        Policy: <span className="font-semibold text-slate-800">{formData.details.tastingPolicy || 'Available for Couple'}</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visibility Status Toggle */}
            <div className="p-4 rounded-xl border border-[#E8DDE4] bg-white">
              <Toggle
                id="toggle-listing-status"
                label="Make Listing Active"
                description="When enabled, couples can discover and send inquiries for this service immediately."
                checked={formData.status === 'Active'}
                onChange={(val) => handleFieldChange('status', val ? 'Active' : 'Draft')}
              />
            </div>
          </div>
        )}

      </div>

      {/* ── Sticky Bottom Wizard Actions ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#F1E5EC] bg-white/95 backdrop-blur-md px-6 py-3.5 shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            type="button"
            id="wizard-prev-btn"
            disabled={currentStep === 1}
            onClick={handlePrevStep}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-[#E8DDE4] bg-white px-4 py-2 text-xs font-semibold text-[#555] transition ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-slate-50 active:scale-95'
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              id="wizard-save-footer-btn"
              onClick={handleSaveDraft}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#E8DDE4] bg-white px-4 py-2 text-xs font-semibold text-[#555] hover:border-[#8E406F] transition"
            >
              <Save size={14} className="text-[#8E406F]" />
              Save Draft
            </button>

            <button
              type="button"
              id="wizard-next-btn"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8E406F] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#73325A] active:scale-95"
            >
              {currentStep === STEPS.length ? (
                <>
                  <Check size={14} />
                  {isEditMode ? 'Save & Finish' : 'Publish Listing'}
                </>
              ) : (
                <>
                  Continue to Step {currentStep + 1}
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
