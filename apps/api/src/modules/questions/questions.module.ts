import { Module } from '@nestjs/common';
import { QuestionEngine } from './application/question-engine.js';
import { QuestionRepository } from './infrastructure/question.repository.js';

@Module({
  providers: [QuestionRepository, QuestionEngine],
  exports: [QuestionEngine],
})
export class QuestionsModule {}
