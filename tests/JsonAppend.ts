import test from 'ava';
import {JacksonError, JsonAppend, ObjectMapper} from '../src';
import {JsonIncludeType} from '../src/annotations/JsonInclude';

test('@JsonAppend with value', t => {
  @JsonAppend({attrs: [
    {
      value: 'version',
    }
  ]})
  class User {
    id: number;
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const user = new User(1, 'pichillilorenzo@gmail.com');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user, {
    attributes: {
      version: 1.2
    }
  });

  t.assert(jsonData.endsWith('"version":1.2}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(!Object.hasOwnProperty.call(userParsed, 'version'));
});

test('@JsonAppend with prepend', t => {
  @JsonAppend({prepend: true, attrs: [
    {
      value: 'version',
    }
  ]})
  class User {
    id: number;
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const user = new User(1, 'pichillilorenzo@gmail.com');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user, {
    attributes: {
      version: 1.2
    }
  });

  t.assert(jsonData.startsWith('{"version":1.2,'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(!Object.hasOwnProperty.call(userParsed, 'version'));
});

test('@JsonAppend with userVersion', t => {
  @JsonAppend({attrs: [
    {
      value: 'version',
      propName: 'userVersion'
    }
  ]})
  class User {
    id: number;
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const user = new User(1, 'pichillilorenzo@gmail.com');
  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify(user, {
    attributes: {
      version: 1.2
    }
  });

  t.assert(jsonData.endsWith('"userVersion":1.2}'));

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(!Object.hasOwnProperty.call(userParsed, 'version'));
  t.assert(!Object.hasOwnProperty.call(userParsed, 'userVersion'));
});

test('@JsonAppend fail with value required', t => {
  @JsonAppend({attrs: [
    {
      value: 'version',
      required: true
    }
  ]})
  class User {
    id: number;
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const user = new User(1, 'pichillilorenzo@gmail.com');
  const objectMapper = new ObjectMapper();

  const err = t.throws<JacksonError>(() => {
    objectMapper.stringify<User>(user);
  });

  t.assert(err instanceof JacksonError);
});

test('@JsonAppend include only if value is non null', t => {
  @JsonAppend({attrs: [
    {
      value: 'version',
      include: JsonIncludeType.NON_NULL
    }
  ]})
  class User {
    id: number;
    email: string;

    constructor(id: number, email: string) {
      this.id = id;
      this.email = email;
    }
  }

  const user = new User(1, 'pichillilorenzo@gmail.com');
  const objectMapper = new ObjectMapper();

  const jsonDataWithNull = objectMapper.stringify<User>(user, {
    attributes: {
      version: null
    }
  });

  t.assert(!jsonDataWithNull.includes('version'));
  t.assert(!jsonDataWithNull.includes('1.2'));

  const userParsedWithNull = objectMapper.parse<User>(jsonDataWithNull, {mainCreator: () => [User]});
  t.assert(userParsedWithNull instanceof User);
  // @ts-ignore
  t.is(userParsedWithNull.version, undefined);

  const jsonDataWithValue = objectMapper.stringify<User>(user, {
    attributes: {
      version: 1.2
    }
  });

  t.assert(jsonDataWithValue.endsWith('"version":1.2}'));

  const userParsedWithValue = objectMapper.parse<User>(jsonDataWithNull, {mainCreator: () => [User]});
  t.assert(userParsedWithValue instanceof User);
  t.assert(!Object.hasOwnProperty.call(userParsedWithValue, 'version'));
});
