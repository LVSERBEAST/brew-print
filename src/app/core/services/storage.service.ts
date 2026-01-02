import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private authService = inject(AuthService);
  private uploadUrl = `https://api.cloudinary.com/v1_1/${environment.cloudinary.cloudName}/image/upload`;

  async uploadBeanPhoto(file: File, beanId: string): Promise<string> {
    const userId = this.authService.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    formData.append('public_id', `beans/${userId}/${beanId}`);

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData,
    });
    console.log(response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary Error:', errorData);
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    const userId = this.authService.currentUser()?.id;
    if (!userId) throw new Error('User not authenticated');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    formData.append('public_id', `profiles/${userId}`);

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();
    return data.secure_url;
  }
}
