import { FindConditions, FindManyOptions } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Interview } from './interview.entity';
import { InterviewApplicationDto, InterviewAssignmentDto, InterviewAddEditDto } from './dto';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class InterviewService {
  constructor( public userService: UserService) {}

  get(options: FindConditions<Interview> & FindManyOptions<Interview>): Promise<Interview[]> {
    const defaultOptions = {
      order: { date: 'DESC' },
    };
    return Interview.find({
      ...defaultOptions,
      ...options,
    });
  }

  async create(dto: InterviewAddEditDto): Promise<Interview> {
    const { interviewerId, intervieweeId, ...restDto } = dto;
    let interviewee: User | undefined;
    let interviewer: User | undefined;
    if (interviewerId) {
      interviewer = await this.userService.findOneById(Number(interviewerId), 'interviewer');
    }
    if (intervieweeId) {
      interviewee = await this.userService.findOneById(Number(intervieweeId), 'user');
    }
    const entity = {
      ...restDto,
      interviewee,
      interviewer,
      // TODO: we need to trim empty props from request body on pipe level.
      date: restDto.date || undefined,
    };
    const interview = Interview.create(entity);
    return interview.save();
  }

  async update(interview: Interview, dto: InterviewAddEditDto): Promise<Interview> {
    const { interviewerId, intervieweeId } = dto;
    const interviewee = await User.findOneOrFail(Number(intervieweeId), { relations: ['user'] });
    let interviewer: User | null = null;
    if (interviewerId) {
      interviewer = await User.findOneOrFail(Number(interviewerId));
    }

    interview.interviewee = interviewee;
    interview.interviewer = interviewer;
    interview.date = new Date(dto.date);
    interview.description = dto.description;
    interview.profession = dto.profession;
    interview.position = dto.position;
    interview.videoLink = dto.videoLink;

    return interview.save();
  }

  addApplication(interviewApplicationDto: InterviewApplicationDto, user: User): Promise<Interview> {
    const entity = { ...interviewApplicationDto, interviewee: user };
    const interview = Interview.create(entity);
    return interview.save();
  }

  editApplication(application: Interview, dto: InterviewApplicationDto): Promise<Interview> {
    application.profession = dto.profession;
    application.position = dto.position;
    application.description = dto.description;

    return application.save();
  }

  async assign(id: number, dto: InterviewAssignmentDto): Promise<Interview> {
    const interview = await Interview.findOneOrFail(id);
    const { interviewerId } = dto;
    const interviewer = await this.userService.findOneById(Number(interviewerId));

    interview.interviewer = interviewer;
    interview.date = new Date(dto.date);
    interview.videoLink = dto.videoLink;

    return interview.save();
  }
}
