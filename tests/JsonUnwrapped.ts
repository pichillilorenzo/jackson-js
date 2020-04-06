import test from 'ava';
import {JsonClass} from '../src/decorators/JsonClass';
import {JsonUnwrapped} from '../src/decorators/JsonUnwrapped';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonUnwrapped', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    @JsonUnwrapped()
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    @JsonProperty()
    first: string;
    @JsonProperty()
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"first":"John","last":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});

test('@JsonUnwrapped with prefix', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    @JsonUnwrapped({prefix: 'parent-'})
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    @JsonProperty()
    first: string;
    @JsonProperty()
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"parent-first":"John","parent-last":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});

test('@JsonUnwrapped with suffix', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    @JsonUnwrapped({suffix: '-parent'})
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    @JsonProperty()
    first: string;
    @JsonProperty()
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"first-parent":"John","last-parent":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});

test('@JsonUnwrapped with prefix and suffix', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    @JsonUnwrapped({prefix: 'parentPrefix-', suffix: '-parentSuffix'})
    @JsonClass({class: () => [Name]})
    name: Name;

    constructor(id: number, name: Name) {
      this.id = id;
      this.name = name;
    }

  }

  class Name {
    @JsonProperty()
    first: string;
    @JsonProperty()
    last: string;

    constructor(first: string, last: string) {
      this.first = first;
      this.last = last;
    }
  }

  const name = new Name('John', 'Alfa');
  const user = new User(1, name);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<User>(user);
  t.is(jsonData, '{"id":1,"parentPrefix-first-parentSuffix":"John","parentPrefix-last-parentSuffix":"Alfa"}');

  const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
  t.assert(userParsed instanceof User);
  t.assert(userParsed.name instanceof Name);
  t.is(userParsed.id, 1);
  t.is(userParsed.name.first, 'John');
  t.is(userParsed.name.last, 'Alfa');
});
