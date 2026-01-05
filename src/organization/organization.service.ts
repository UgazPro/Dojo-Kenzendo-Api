import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationService {

    constructor(private readonly prismaService: PrismaService) { }

    async getDojos() {
        return await this.prismaService.dojos.findMany();
    }

    async getMartialArts() {
        return await this.prismaService.martialArts.findMany();
    }

    async getRanks(martialArtId?: string) {
        const where: any = {};

        if (martialArtId) {
            where.martialArtId = Number(martialArtId);
        }

        return await this.prismaService.ranks.findMany({
            where,
            orderBy: { id: 'asc' },
        });
    }
}
