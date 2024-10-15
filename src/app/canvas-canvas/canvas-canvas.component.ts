import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RecordModel } from 'pocketbase';
import { CanvasService } from '../canvas.service';
import { PocketBaseService } from '../pocket-base.service';

@Component({
  selector: 'app-canvas-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas-canvas.component.html',
  styleUrl: './canvas-canvas.component.scss'
})
export class CanvasCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas')
  protected canvasElement!: ElementRef<HTMLCanvasElement>

  @Input({ required: true })
  id = ''

  canvas?: RecordModel

  pixels: RecordModel[] = []

  color?: string

  ctx!: CanvasRenderingContext2D

  private scale = 6

  constructor(
    private readonly canvasService: CanvasService, 
    private readonly pbService: PocketBaseService
  ) {
  }

  async ngAfterViewInit() {
    this.canvas = await this.canvasService.get(this.id)

    this.canvasElement.nativeElement.width = this.canvas!['width'] * this.scale
    this.canvasElement.nativeElement.height = this.canvas!['height'] * this.scale
    
    this.pixels = await this.canvasService.getPixels(this.id)

    this.ctx = this.canvasElement.nativeElement.getContext('2d')!

    this.ctx.scale(this.scale, this.scale)

    for (const p of this.pixels) {
      this.ctx.fillStyle = p['color']
      this.ctx.fillRect(p['y']-1, p['x']-1, 1, 1)
    }
    
    this.pbService.pb.collection('pixels').subscribe('*', (e) => {
      if (e.record['canvas_id'] !== this.id) {
        return
      }

      this.ctx.fillStyle = e.record['color']
      this.ctx.fillRect(e.record['y']-1, e.record['x']-1, 1, 1)
    })
  }

  async ngOnDestroy() {
    await this.pbService.pb.collection('pixels').unsubscribe('*')
  }
  
  async onColorSelected(color: string) {
    this.color = color
  }

  async onPixelClicked(event: MouseEvent) {
    const rect = this.canvasElement!.nativeElement.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / this.scale);
    const y = Math.round((event.clientY - rect.top) / this.scale);
    console.log('Coordinates: (' + x + ', ' + y + ')');

    if (!this.color) {
      return
    }

    const pixel = this.pixels.find(p => p['y'] === x && p['x'] === y)
    if (!pixel) {
      return
    }

    console.log(pixel);
    
    this.ctx.fillStyle = this.color
    this.ctx.fillRect(pixel['y']-1, pixel['x']-1, 1, 1)

    await this.canvasService.setPixelColor(pixel.id, this.color)
  }
}
