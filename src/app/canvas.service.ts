import { Injectable } from '@angular/core';
import { PocketBaseService } from './pocket-base.service';
import { RecordModel } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  constructor(private pbService: PocketBaseService) {
  }

  async get(id: string) {
    return await this.pbService.pb.collection('canvases').getOne(id, {
      expand: "pixels_via_canvas_id"
    })
  }

  async getPixels(id: string) {
    const response = await fetch(`https://pb.fs223.de/api/canvases/${id}/pixels`)
    const data = await response.json()
    return data.pixels as RecordModel[]
  }

  async setPixelColor(id: string, color: string) {
    return await this.pbService.pb.collection('pixels').update(id, {
      color
    })
  }
}
