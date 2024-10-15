import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CanvasService } from '../canvas.service';
import { RecordModel } from 'pocketbase';
import { PocketBaseService } from '../pocket-base.service';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  id = ''

  canvas?: RecordModel

  pixels: RecordModel[][] = []

  color?: string

  constructor(
    private readonly canvasService: CanvasService, 
    private readonly pbService: PocketBaseService
  ) {}

  async ngOnInit() {
    this.canvas = await this.canvasService.get(this.id)

    const pixels = await this.canvasService.getPixels(this.id)

    for (let i = 1; i < this.canvas['height']; i++) {
      this.pixels.push(pixels.filter(p => p['y'] === i))
    }

    this.pbService.pb.collection('pixels').subscribe('*', (e) => {
      if (e.record['canvas_id'] !== this.id) {
        return
      }

      const pixel = this.pixels.flatMap(p => p).find(p => p.id === e.record.id)
      if (!pixel) {
        return
      }

      pixel['color'] = e.record['color']
    })
  }

  async ngOnDestroy() {
    await this.pbService.pb.collection('pixels').unsubscribe('*')
  }

  async onColorSelected(color: string) {
    this.color = color
  }

  async onPixelClicked(pixel: RecordModel) {
    if (!this.color) {
      return
    }

    pixel['color'] = this.color
    await this.canvasService.setPixelColor(pixel.id, pixel['color'])
  }
}
