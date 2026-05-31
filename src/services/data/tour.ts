import { TourStep } from '../../types';

export const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: "Search & Discover Autoparts",
    description: "Type a part name, OEM number, make, or dynamic VIN code right in our search bar. Autocomplete returns instant matching specs from Algolia.",
    elementId: "tour-search"
  },
  {
    step: 2,
    title: "Browse by Handpicked Categories",
    description: "Mechanics and restorers can filter instantly by heavy engines, transmissions, steering, or suspension blocks to source exact matches.",
    elementId: "tour-categories"
  },
  {
    step: 3,
    title: "Examine Detailed Fitment Maps",
    description: "Every individual part listing showcases its exact vehicle extraction history, mileage, actual photos, and a custom metal authentication tag.",
    elementId: "tour-part-view"
  },
  {
    step: 4,
    title: "Trust & Quality Badges",
    description: "We work strictly with vetted, high-rating salvage yards. See seller specialty tags, star ratings, and certified condition checks.",
    elementId: "tour-trust"
  },
  {
    step: 5,
    title: "Negotiate / Buy Outright",
    description: "Place items directly in your cart, or hit 'Make Offer' to negotiate a project-friendly build budget directly with the yard owner!",
    elementId: "tour-cta"
  }
];
