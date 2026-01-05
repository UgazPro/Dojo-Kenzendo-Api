import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationService {

    constructor(private readonly prismaService: PrismaService) { }

    getDojos(){
        return this.prismaService.dojos.findMany();
    }

    getMartialArts(){
        return this.prismaService.martialArts.findMany();
    }

    getRanks(martialArtId?: string){
        const where: any = {};

        if (martialArtId) {
            where.martialArtId = Number(martialArtId);
        }

        return this.prismaService.ranks.findMany({
            where,
            orderBy: { id: 'asc' },
        });
    }
}
