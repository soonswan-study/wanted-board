import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KeywordAlert } from 'src/entities/keyword-alert.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(KeywordAlert)
    private readonly keywordAlertRepository: Repository<KeywordAlert>,
  ) {}

  async checkKeywordAlerts(content: string): Promise<void> {
    // NOTE(swan): 키워드 알림 등록된 사용자들을 조회.
    const keywordAlerts = await this.keywordAlertRepository.find();

    for (const alert of keywordAlerts) {
      // NOTE(swan): 키워드가 포함되어 있는지 확인.
      if (content.includes(alert.keyword)) {
        this.sendNotification(alert.authorName, alert.keyword, content);
      }
    }
  }

  private sendNotification(
    authorName: string,
    keyword: string,
    content: string,
  ) {
    // NOTE(swan): 실제 알림 전송 기능은 구현하지 않고 함수 호출만 함.
    console.log(
      `알림 전송: ${authorName}님이 등록하신 키워드 "${keyword}"가 포함된 내용이 등록되었습니다.`,
    );
    console.log(`내용: ${content.substring(0, 20)}...`);

    // TODO(swan): 실제 구현에서는 이메일, SMS, 푸시 알림 등 구현 예정.
  }
}
