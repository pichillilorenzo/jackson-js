import test from 'ava';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter, JsonSetterNulls} from '../src/decorators/JsonSetter';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClassType} from '../src/decorators/JsonClassType';
import {JacksonError} from '../src/core/JacksonError';

test('@JsonGetter and @JsonSetter', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    fullname: string[];

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }

    @JsonGetter()
    getFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonSetter()
    setFullname(fullname: string) {
      this.fullname = fullname.split(' ');
    }
  }

  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.fullname instanceof Array);
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});

test('@JsonGetter and @JsonSetter with value', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    fullname: string[];

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }

    @JsonGetter({value: 'fullname'})
    getMyFullname(): string {
      return this.firstname + ' ' + this.lastname;
    }

    @JsonSetter({value: 'fullname'})
    setMyFullname(fullname: string) {
      this.fullname = fullname.split(' ');
    }
  }

  const user = new User(1, 'John', 'Alfa');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":1,"firstname":"John","lastname":"Alfa","fullname":"John Alfa"}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.fullname instanceof Array);
  t.deepEqual(userParsed.fullname, ['John', 'Alfa']);
});

test('@JsonSetter with nulls and contentNulls options set to JsonSetterNulls.FAIL', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    otherInfoArray: string[] = [];
    @JsonProperty()
    @JsonClassType({type: () => [Map]})
    otherInfoMap: Map<string, string> = new Map();
    @JsonProperty()
    otherInfoObjLiteral = {};

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }

    @JsonSetter({nulls: JsonSetterNulls.FAIL, contentNulls: JsonSetterNulls.FAIL})
    setOtherInfoArray(@JsonClassType({type: () => [Array]}) otherInfoArray: string[]) {
      this.otherInfoArray = otherInfoArray;
    }

    @JsonSetter({nulls: JsonSetterNulls.FAIL, contentNulls: JsonSetterNulls.FAIL})
    setOtherInfoMap(@JsonClassType({type: () => [Map]}) otherInfoMap: Map<string, string>) {
      this.otherInfoMap = otherInfoMap;
    }

    @JsonSetter({nulls: JsonSetterNulls.FAIL, contentNulls: JsonSetterNulls.FAIL})
    setOtherInfoObjLiteral(otherInfoObjLiteral: any) {
      this.otherInfoObjLiteral = otherInfoObjLiteral;
    }
  }

  const objectMapper = new ObjectMapper();

  let err = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":null,"otherInfoMap":{},"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  });
  t.assert(err instanceof JacksonError);

  err = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":["info 1", null, "info 3"],"otherInfoMap":{},"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  });
  t.assert(err instanceof JacksonError);

  err = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":null,"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  });
  t.assert(err instanceof JacksonError);

  err = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":{"mapKey1": "mapValue1","mapKey2":null,"mapKey3":"mapValue3"},"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  });
  t.assert(err instanceof JacksonError);

  err = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":{},"otherInfoObjLiteral":null}', {mainCreator: () => [User]});
  });
  t.assert(err instanceof JacksonError);

  err = t.throws<JacksonError>(() => {
    // eslint-disable-next-line max-len
    objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":{},"otherInfoObjLiteral":{"objLiteralKey1": "objLiteralValue1","objLiteralKey2":null,"objLiteralKey3":"objLiteralValue3"}}', {mainCreator: () => [User]});
  });
  t.assert(err instanceof JacksonError);
});

test('@JsonSetter with nulls and contentNulls options set to JsonSetterNulls.SKIP', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    otherInfoArray: string[] = [];
    @JsonProperty()
    @JsonClassType({type: () => [Map]})
    otherInfoMap: Map<string, string> = new Map();
    @JsonProperty()
    otherInfoObjLiteral = {};

    constructor(id: number, firstname: string, lastname: string) {
      this.id = id;
      this.firstname = firstname;
      this.lastname = lastname;
    }

    @JsonSetter({nulls: JsonSetterNulls.SKIP, contentNulls: JsonSetterNulls.SKIP})
    setOtherInfoArray(@JsonClassType({type: () => [Array]}) otherInfoArray: string[]) {
      this.otherInfoArray = otherInfoArray;
    }

    @JsonSetter({nulls: JsonSetterNulls.SKIP, contentNulls: JsonSetterNulls.SKIP})
    setOtherInfoMap(@JsonClassType({type: () => [Map]}) otherInfoMap: Map<string, string>) {
      this.otherInfoMap = otherInfoMap;
    }

    @JsonSetter({nulls: JsonSetterNulls.SKIP, contentNulls: JsonSetterNulls.SKIP})
    setOtherInfoObjLiteral(otherInfoObjLiteral: any) {
      this.otherInfoObjLiteral = otherInfoObjLiteral;
    }
  }

  const objectMapper = new ObjectMapper();

  // eslint-disable-next-line max-len
  let userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":null,"otherInfoMap":{},"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.otherInfoArray instanceof Array);
  t.deepEqual(userParsed.otherInfoArray, []);
  t.assert(userParsed.otherInfoMap instanceof Map);
  t.deepEqual(userParsed.otherInfoMap, new Map());

  // eslint-disable-next-line max-len
  userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":["info 1", null, "info 3"],"otherInfoMap":{},"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.otherInfoArray instanceof Array);
  t.deepEqual(userParsed.otherInfoArray, ['info 1', 'info 3']);
  t.assert(userParsed.otherInfoMap instanceof Map);
  t.deepEqual(userParsed.otherInfoMap, new Map());
  t.assert(userParsed.otherInfoObjLiteral instanceof Object);
  t.deepEqual(userParsed.otherInfoObjLiteral, {});

  // eslint-disable-next-line max-len
  userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":null,"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.otherInfoArray instanceof Array);
  t.deepEqual(userParsed.otherInfoArray, []);
  t.assert(userParsed.otherInfoMap instanceof Map);
  t.deepEqual(userParsed.otherInfoMap, new Map());
  t.assert(userParsed.otherInfoObjLiteral instanceof Object);
  t.deepEqual(userParsed.otherInfoObjLiteral, {});

  // eslint-disable-next-line max-len
  userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":{"mapKey1": "mapValue1","mapKey2":null,"mapKey3":"mapValue3"},"otherInfoObjLiteral":{}}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.otherInfoArray instanceof Array);
  t.deepEqual(userParsed.otherInfoArray, []);
  t.assert(userParsed.otherInfoMap instanceof Map);
  t.deepEqual(userParsed.otherInfoMap, new Map([['mapKey1', 'mapValue1'], ['mapKey3', 'mapValue3']]));
  t.assert(userParsed.otherInfoObjLiteral instanceof Object);
  t.deepEqual(userParsed.otherInfoObjLiteral, {});

  // eslint-disable-next-line max-len
  userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":{},"otherInfoObjLiteral":null}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.otherInfoArray instanceof Array);
  t.deepEqual(userParsed.otherInfoArray, []);
  t.assert(userParsed.otherInfoMap instanceof Map);
  t.deepEqual(userParsed.otherInfoMap, new Map());
  t.assert(userParsed.otherInfoObjLiteral instanceof Object);
  t.deepEqual(userParsed.otherInfoObjLiteral, {});

  // eslint-disable-next-line max-len
  userParsed = objectMapper.parse<User>('{"id":1,"firstname":"John","lastname":"Alfa","otherInfoArray":[],"otherInfoMap":{},"otherInfoObjLiteral":{"objLiteralKey1": "objLiteralValue1","objLiteralKey2":null,"objLiteralKey3":"objLiteralValue3"}}', {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.is(userParsed.id, 1);
  t.is(userParsed.firstname, 'John');
  t.is(userParsed.lastname, 'Alfa');
  t.assert(userParsed.otherInfoArray instanceof Array);
  t.deepEqual(userParsed.otherInfoArray, []);
  t.assert(userParsed.otherInfoMap instanceof Map);
  t.deepEqual(userParsed.otherInfoMap, new Map());
  t.assert(userParsed.otherInfoObjLiteral instanceof Object);
  t.deepEqual(userParsed.otherInfoObjLiteral, {objLiteralKey1: 'objLiteralValue1', objLiteralKey3: 'objLiteralValue3'});
});
