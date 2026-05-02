import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Get()
  findAll(@Request() req) {
    return this.campaignsService.findByUser(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.campaignsService.create(req.user.id, body);
  }

  @Patch(':id/pause')
  pause(@Param('id') id: string, @Request() req) {
    return this.campaignsService.pause(id, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.campaignsService.delete(id, req.user.id);
  }
}