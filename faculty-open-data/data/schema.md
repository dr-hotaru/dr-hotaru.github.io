# 公募採用データスキーマ

公開対象は、大学・研究機関の公式発表、公式公募ページ、公式採用報告、本人の公式プロフィール等で、採用者本人と公募種別の対応を確認できるものに限ります。

## fields

- `id`: 安定ID。例: `university-department-name-year`
- `name`: 氏名。公式発表の表記に合わせる。
- `fiscalYear`: 公募または採用の年度。
- `field`: 大分類。例: 生命科学、情報科学、工学、人文社会科学。
- `university`: 大学・研究機関名。
- `department`: 所属部局。
- `position`: 採用職位。
- `appointmentYear`: 採用年度。
- `callType`: 公募種別。公式表記を記録する。
- `verificationStatus`: `verified` のみ公開対象。
- `evidenceNote`: 公式根拠の要約。
- `sources`: 根拠URLの配列。
- `baselinePublications.leadAuthor`: 採択時点までの主著論文数。
- `baselinePublications.coauthored`: 採択時点までの共著論文数。
- `publicationTimeline`: 採用年度以降の年別論文数。

## 非公開候補

以下は公開データにしません。

- 氏名や写真から性別を推測したもの。
- 公募時期と採用時期が近いだけのもの。
- 採用者名はあるが、公募種別との対応が確認できないもの。
- SNS、掲示板、匿名情報だけに基づくもの。
