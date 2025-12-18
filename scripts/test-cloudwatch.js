// CloudWatch接続テストスクリプト
const { CloudWatchLogsClient, DescribeLogGroupsCommand } = require('@aws-sdk/client-cloudwatch-logs');

require('dotenv').config({ path: '.env.local' });

async function testCloudWatchConnection() {
  console.log('🔍 CloudWatch接続テスト開始...\n');

  // 1. 環境変数チェック
  console.log('📋 環境変数チェック:');
  console.log(`  AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ 設定済み' : '❌ 未設定'}`);
  console.log(`  AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ 設定済み' : '❌ 未設定'}`);
  console.log(`  AWS_REGION: ${process.env.AWS_REGION || 'ap-northeast-1'}`);
  console.log(`  CLOUDWATCH_LOG_GROUP_NAME: ${process.env.CLOUDWATCH_LOG_GROUP_NAME || '/tentspace/frontend-errors'}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS認証情報が設定されていません');
    console.log('\n.env.local に以下を追加してください:');
    console.log('AWS_ACCESS_KEY_ID=your_access_key');
    console.log('AWS_SECRET_ACCESS_KEY=your_secret_key');
    return;
  }

  // 2. CloudWatch接続テスト
  try {
    const client = new CloudWatchLogsClient({
      region: process.env.AWS_REGION || 'ap-northeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    console.log('🔌 CloudWatch接続中...');
    const command = new DescribeLogGroupsCommand({
      logGroupNamePrefix: process.env.CLOUDWATCH_LOG_GROUP_NAME || '/tentspace/frontend-errors',
    });

    const response = await client.send(command);
    
    if (response.logGroups && response.logGroups.length > 0) {
      console.log('✅ CloudWatch接続成功！\n');
      console.log('📁 ロググループ情報:');
      response.logGroups.forEach(group => {
        console.log(`  - ${group.logGroupName}`);
        console.log(`    作成日時: ${new Date(group.creationTime).toLocaleString('ja-JP')}`);
        console.log(`    保持期間: ${group.retentionInDays || '無期限'}`);
      });
    } else {
      console.log('⚠️  ロググループが見つかりません');
      console.log(`\nAWSコンソールで以下を作成してください:`);
      console.log(`ロググループ名: ${process.env.CLOUDWATCH_LOG_GROUP_NAME || '/tentspace/frontend-errors'}`);
    }

    console.log('\n✅ すべてのテストが完了しました！');
    console.log('\nCloudWatchへのログ送信をテストするには:');
    console.log('  NODE_ENV=production npm run dev');
    
  } catch (error) {
    console.error('❌ CloudWatch接続エラー:\n', error.message);
    
    if (error.name === 'InvalidClientTokenId') {
      console.log('\n💡 AWS_ACCESS_KEY_ID が無効です');
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.log('\n💡 AWS_SECRET_ACCESS_KEY が無効です');
    } else if (error.name === 'UnrecognizedClientException') {
      console.log('\n💡 AWS認証情報が間違っています');
    }
  }
}

testCloudWatchConnection();

