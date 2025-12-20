import { Controller, Post, Body } from '@nestjs/common';
import {createOnboardingDto} from './dto/createonboarding.dto';
import { RecruitmentService} from './recruitment.service';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Post('/onboard')
  async createRecruitmentonboard(@Body() dto: createOnboardingDto) {
    const onboardingtasks = await this.recruitmentService.createRecruitmentonboard(dto);
    console.log('Onboarding Tasks Created:', onboardingtasks);
    return onboardingtasks;
  }


}

