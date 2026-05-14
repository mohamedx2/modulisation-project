import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_CAR_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDQwQzEyIDM2LjY4NCAxNC42ODQgMzQgMTggMzRIMzJDMzUuMzE2IDM0IDM4IDM2LjY4NCAzOCA0MFY0MkgxMlY0MFoiIGZpbGw9IiM2QjcyODAiLz4KPHBhdGggZD0iTTIwIDMwTDI4IDI2TDMyIDMwVjM4SDIwVjMwWiIgZmlsbD0iIzZCNzI4MCIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjQwIiByPSI0IiBmaWxsPSIjMkQzMjM4Ii8+CjxjaXJjbGUgY3g9IjMyIiBjeT0iNDAiIHI9IjQiIGZpbGw9IiMyRDMxMjgiLz4KPHBhdGggZD0iTTE2IDM4SDQyVjQySDE2VjM4WiIgZmlsbD0iIzJEMzIzOCIvPgo8L3N2Zz4K';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return vehicles.map((v) => {
      let imageUrl = DEFAULT_CAR_ICON;

      if (v.img && v.img.includes('base64,')) {
        imageUrl = v.img;
      } else if (v.imageData) {
        imageUrl = `data:image/jpeg;base64,${Buffer.from(v.imageData).toString('base64')}`;
      }

      return {
        ...v,
        tenantName: v.tenant?.name || 'Default',
        imageData: v.imageData ? `data:image/jpeg;base64,${Buffer.from(v.imageData).toString('base64')}` : null,
        img: imageUrl,
      };
    });
  }

  async findAllAdmin() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { deletedAt: null },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return vehicles.map((v) => ({
      ...v,
      tenantName: v.tenant?.name || 'Default',
      imageData: v.imageData ? `data:image/jpeg;base64,${Buffer.from(v.imageData).toString('base64')}` : null,
      img: v.img || DEFAULT_CAR_ICON,
    }));
  }

  async create(tenantId: string, data: { name: string; plate: string; img?: string; imageData?: Buffer }) {
    // Check if vehicle with same plate already exists
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { plate: data.plate },
    });

    if (existingVehicle) {
      throw new ConflictException(`La plaque ${data.plate} est déjà enregistrée dans le système.`);
    }

    // Ensure the tenant exists (auto-create on fresh databases)
    await this.prisma.tenant.upsert({
      where: { id: tenantId },
      update: {},
      create: { id: tenantId, name: 'Default Tenant' },
    });

    return this.prisma.vehicle.create({
      data: {
        name: data.name,
        plate: data.plate,
        img: data.img,
        imageData: data.imageData,
        tenantId,
        health: 100,
        lastService: 'A l\'instant',
      },
    });
  }

  async update(vehicleId: string, tenantId: string, data: { name?: string; plate?: string; health?: number; lastService?: string; img?: string }) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException('Vehicule non trouve');
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data,
    });
  }

  async updateAdmin(vehicleId: string, data: { name?: string; plate?: string; health?: number; lastService?: string; img?: string }) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException('Vehicule non trouve');
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data,
    });
  }

  async remove(vehicleId: string, tenantId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException('Vehicule non trouve');
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { deletedAt: new Date() },
    });
  }

  async removeAdmin(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException('Vehicule non trouve');
    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { deletedAt: new Date() },
    });
  }

  async uploadImage(vehicleId: string, tenantId: string, buffer: Buffer, mimeType: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId, deletedAt: null },
    });
    if (!vehicle) throw new NotFoundException('Vehicule non trouve');

    const base64Data = buffer.toString('base64');
    const updated = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        imageData: buffer,
        img: `data:${mimeType};base64,${base64Data}`,
      },
      select: { id: true, img: true },
    });
    return updated;
  }

  async getImage(vehicleId: string, tenantId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId, deletedAt: null },
      select: { imageData: true, img: true },
    });
    if (!vehicle || !vehicle.imageData) throw new NotFoundException('Image non trouvee');
    return vehicle;
  }
}
