export function createTourServices({
  getPublicTour,
  listPublishedTours,
  getVersion,
  listProjects,
  listProjectLocations,
  listVersions,
}) {
  return {
    getPublicTour: (token) => getPublicTour(token),
    listPublishedTours: () => listPublishedTours(),
    getVersion: (locationId, versionId) => getVersion(locationId, versionId),
    listProjects: () => listProjects(),
    listProjectLocations: (projectId) => listProjectLocations(projectId),
    listVersions: (locationId) => listVersions(locationId),
  };
}
