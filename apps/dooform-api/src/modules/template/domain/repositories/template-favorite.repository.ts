export interface ITemplateFavoriteRepository {
  /**
   * Add a template to the user's favorites.
   * Returns true if added, false if already exists.
   */
  addFavorite(userId: string, templateId: string): Promise<boolean>

  /**
   * Remove a template from the user's favorites.
   * Returns true if removed, false if not found.
   */
  removeFavorite(userId: string, templateId: string): Promise<boolean>

  /**
   * Check if a template is in the user's favorites.
   */
  isFavorite(userId: string, templateId: string): Promise<boolean>

  /**
   * Get all favorite template IDs for a user.
   */
  getFavoriteTemplateIds(userId: string): Promise<string[]>
}

export const ITemplateFavoriteRepository = Symbol('ITemplateFavoriteRepository')
