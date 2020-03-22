import test from 'ava';
import {JsonAnySetter, ObjectMapper, JacksonError} from '../src';

class ScreenInfo {
  id: string;
  title: string;
  width: number;
  height: number;
  otherInfo: Map<string, any> = new Map<string, any>();

  @JsonAnySetter()
  public setOtherInfo(propertyKey: string, value: any) {
    this.otherInfo.set(propertyKey, value);
  }
}

test('@JsonAnySetter', t => {
  const jsonData = `{
  "xLocation": 400,
  "yLocation": 200,
  "id": "TradeDetails",
  "title": "Trade Details",
  "width": 500,
  "height": 300
}`;
  const objectMapper = new ObjectMapper();

  const screenInfo = objectMapper.parse<ScreenInfo>(jsonData, {mainCreator: () => [ScreenInfo]});

  t.assert(screenInfo instanceof ScreenInfo);
  t.is(screenInfo.id, 'TradeDetails');
  t.is(screenInfo.title, 'Trade Details');
  t.is(screenInfo.width, 500);
  t.is(screenInfo.height, 300);
  t.is(screenInfo.otherInfo.get('xLocation'), 400);
  t.is(screenInfo.otherInfo.get('yLocation'), 200);
});

test('Fail multi @JsonAnySetter annotations', t => {

  const err = t.throws<JacksonError>(() => {
    class ScreenInfoWithMultiJsonAnySetter {
      id: string;
      title: string;
      width: number;
      height: number;
      otherInfo: Map<string, any> = new Map<string, any>();

      @JsonAnySetter()
      public setOtherInfo(propertyKey: string, value: any) {
        this.otherInfo.set(propertyKey, value);
      }

      @JsonAnySetter()
      public setSomeOtherInfo(propertyKey: string, value: any) {
        this.otherInfo.set(propertyKey, value);
      }
    }
  });

  t.assert(err instanceof JacksonError);
});
