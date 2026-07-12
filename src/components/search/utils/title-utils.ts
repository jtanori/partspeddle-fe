export const generatePageTitle = (filters: any) => {
  let viewTitle = 'PartsPeddle Marketplace';
  if (filters.category) {
    viewTitle = `${filters.category} | ${viewTitle}`;
  } else if (filters.system) {
    viewTitle = `${filters.system} | ${viewTitle}`;
  } else {
    viewTitle = `Auto Parts Catalog | ${viewTitle}`;
  }
  // Deep double-word deduplication for "System System" if category or system names contain System
  viewTitle = viewTitle.replace(/\bSystem\s+System\b/gi, 'System');
  return viewTitle;
};
