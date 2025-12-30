import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private storage = inject(Storage);
  private authService = inject(AuthService);
  
  async uploadBeanPhoto(file: File, beanId: string): Promise<string> {
    const userId = this.authService.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');
    
    const extension = file.name.split('.').pop();
    const path = `users/${userId}/beans/${beanId}.${extension}`;
    const storageRef = ref(this.storage, path);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
  
  async deleteBeanPhoto(photoURL: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, photoURL);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Failed to delete photo:', err);
    }
  }
  
  async uploadProfilePhoto(file: File): Promise<string> {
    const userId = this.authService.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');
    
    const extension = file.name.split('.').pop();
    const path = `users/${userId}/profile.${extension}`;
    const storageRef = ref(this.storage, path);
    
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
}
