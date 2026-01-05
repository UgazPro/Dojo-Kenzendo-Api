import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {

    constructor(private readonly organizationService: OrganizationService) {
    }

    @Get('/dojos')
    async getDojos() {
        return await this.organizationService.getDojos();
    }

    @Get('/martial-arts')
    async getMartialArts() {
        return await this.organizationService.getMartialArts();
    }
    
    @Get('/ranks')
    async getRanks(
        @Query('martialArtId') martialArtId?: string,
    ) {
        return await this.organizationService.getRanks(martialArtId);
    }
}
