import test from 'ava';
import {JsonView} from '../src/decorators/JsonView';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonGetter} from '../src/decorators/JsonGetter';
import {JsonSetter} from '../src/decorators/JsonSetter';
import {JsonClassType} from '../src/decorators/JsonClassType';

class Views {
  static public = class Public {};
  static internal = class Internal {};
}

test('@JsonView at class level', t => {
  @JsonView({value: () => [Views.internal]})
  class User {
    @JsonProperty()
    @JsonView({value: () => [Views.public]})
    id: number;
    @JsonProperty()
    @JsonView({value: () => [Views.public]})
    email: string;
    @JsonProperty()
    password: string;
    @JsonProperty()
    @JsonView({value: () => [Views.public]})
    firstname: string;
    @JsonProperty()
    @JsonView({value: () => [Views.public]})
    lastname: string;
    @JsonProperty()
    activationCode: string;

    // eslint-disable-next-line no-shadow
    constructor(id: number, email: string, password: string, firstname: string, lastname: string, activationCode: string) {
      this.id = id;
      this.email = email;
      this.password = password;
      this.firstname = firstname;
      this.lastname = lastname;
      this.activationCode = activationCode;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'rtJ9FrqP!rCE', 'John', 'Alfa', '75afe654-695e-11ea-bc55-0242ac130003');

  const objectMapper = new ObjectMapper();

  const jsonDataWithoutView = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithoutView), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}'));

  // eslint-disable-next-line max-len
  const userParsedWithoutView = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User]
  });
  t.assert(userParsedWithoutView instanceof User);
  t.is(userParsedWithoutView.id, 1);
  t.is(userParsedWithoutView.email, 'john.alfa@gmail.com');
  t.is(userParsedWithoutView.password, 'rtJ9FrqP!rCE');
  t.is(userParsedWithoutView.firstname, 'John');
  t.is(userParsedWithoutView.lastname, 'Alfa');
  t.is(userParsedWithoutView.activationCode, '75afe654-695e-11ea-bc55-0242ac130003');

  const jsonDataWithViewPublic = objectMapper.stringify<User>(user, {withViews: () => [Views.public]});
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithViewPublic), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  // eslint-disable-next-line max-len
  const userParsedWithViewPublic = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User],
    withViews: () => [Views.public]
  });
  t.assert(userParsedWithViewPublic instanceof User);
  t.is(userParsedWithViewPublic.id, 1);
  t.is(userParsedWithViewPublic.email, 'john.alfa@gmail.com');
  t.is(userParsedWithViewPublic.password, null);
  t.is(userParsedWithViewPublic.firstname, 'John');
  t.is(userParsedWithViewPublic.lastname, 'Alfa');
  t.is(userParsedWithViewPublic.activationCode, null);

  const jsonDataWithViewInternal = objectMapper.stringify<User>(user, {withViews: () => [Views.internal]});
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithViewInternal), JSON.parse('{"password":"rtJ9FrqP!rCE","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}'));

  // eslint-disable-next-line max-len
  const userParsedWithViewInternal = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User],
    withViews: () => [Views.internal]
  });
  t.assert(userParsedWithViewInternal instanceof User);
  t.is(userParsedWithViewInternal.id, null);
  t.is(userParsedWithViewInternal.email, null);
  t.is(userParsedWithViewInternal.password, 'rtJ9FrqP!rCE');
  t.is(userParsedWithViewInternal.firstname, null);
  t.is(userParsedWithViewInternal.lastname, null);
  t.is(userParsedWithViewInternal.activationCode, '75afe654-695e-11ea-bc55-0242ac130003');
});

test('@JsonView at property level', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    @JsonView({value: () => [Views.internal]})
    password: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    @JsonView({value: () => [Views.internal]})
    activationCode: string;

    // eslint-disable-next-line no-shadow
    constructor(id: number, email: string, password: string, firstname: string, lastname: string, activationCode: string) {
      this.id = id;
      this.email = email;
      this.password = password;
      this.firstname = firstname;
      this.lastname = lastname;
      this.activationCode = activationCode;
    }
  }

  const user = new User(1, 'john.alfa@gmail.com', 'rtJ9FrqP!rCE', 'John', 'Alfa', '75afe654-695e-11ea-bc55-0242ac130003');

  const objectMapper = new ObjectMapper();

  const jsonDataWithoutView = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithoutView), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}'));

  // eslint-disable-next-line max-len
  const userParsedWithoutView = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User]
  });
  t.assert(userParsedWithoutView instanceof User);
  t.is(userParsedWithoutView.id, 1);
  t.is(userParsedWithoutView.email, 'john.alfa@gmail.com');
  t.is(userParsedWithoutView.password, 'rtJ9FrqP!rCE');
  t.is(userParsedWithoutView.firstname, 'John');
  t.is(userParsedWithoutView.lastname, 'Alfa');
  t.is(userParsedWithoutView.activationCode, '75afe654-695e-11ea-bc55-0242ac130003');

  const jsonDataWithViewPublic = objectMapper.stringify<User>(user, {withViews: () => [Views.public]});
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithViewPublic), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  // eslint-disable-next-line max-len
  const userParsedWithViewPublic = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User],
    withViews: () => [Views.public]
  });
  t.assert(userParsedWithViewPublic instanceof User);
  t.is(userParsedWithViewPublic.id, 1);
  t.is(userParsedWithViewPublic.email, 'john.alfa@gmail.com');
  t.is(userParsedWithViewPublic.password, null);
  t.is(userParsedWithViewPublic.firstname, 'John');
  t.is(userParsedWithViewPublic.lastname, 'Alfa');
  t.is(userParsedWithViewPublic.activationCode, null);

  const jsonDataWithViewInternal = objectMapper.stringify<User>(user, {withViews: () => [Views.internal]});
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithViewInternal), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}'));

  // eslint-disable-next-line max-len
  const userParsedWithViewInternal = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User],
    withViews: () => [Views.internal]
  });
  t.assert(userParsedWithViewInternal instanceof User);
  t.is(userParsedWithViewInternal.id, 1);
  t.is(userParsedWithViewInternal.email, 'john.alfa@gmail.com');
  t.is(userParsedWithViewInternal.password, 'rtJ9FrqP!rCE');
  t.is(userParsedWithViewInternal.firstname, 'John');
  t.is(userParsedWithViewInternal.lastname, 'Alfa');
  t.is(userParsedWithViewInternal.activationCode, '75afe654-695e-11ea-bc55-0242ac130003');
});

test('@JsonView at method level', t => {
  class User {
    @JsonProperty()
    id: number;
    @JsonProperty()
    email: string;
    @JsonProperty()
    password: string;
    @JsonProperty()
    firstname: string;
    @JsonProperty()
    lastname: string;
    @JsonProperty()
    activationCode: string;

    // eslint-disable-next-line no-shadow
    constructor(id: number, email: string, password: string, firstname: string, lastname: string, activationCode: string) {
      this.id = id;
      this.email = email;
      this.password = password;
      this.firstname = firstname;
      this.lastname = lastname;
      this.activationCode = activationCode;
    }

    @JsonGetter()
    @JsonView({value: () => [Views.internal]})
    getPassword(): string {
      return this.password;
    }

    @JsonSetter()
    @JsonView({value: () => [Views.internal]})
    // eslint-disable-next-line no-shadow
    setPassword(password: string) {
      this.password = password;
    }

    @JsonGetter()
    @JsonView({value: () => [Views.internal]})
    getActivationCode(): string {
      return this.activationCode;
    }

    @JsonSetter()
    @JsonView({value: () => [Views.internal]})
    // eslint-disable-next-line no-shadow
    setActivationCode(activationCode: string) {
      this.activationCode = activationCode;
    }
  }

  const password = 'rtJ9FrqP!rCE';
  const activationCode = '75afe654-695e-11ea-bc55-0242ac130003';
  const user = new User(1, 'john.alfa@gmail.com', password, 'John', 'Alfa', activationCode);

  const objectMapper = new ObjectMapper();

  const jsonDataWithoutView = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithoutView), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}'));

  // eslint-disable-next-line max-len
  const userParsedWithoutView = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User]
  });
  t.assert(userParsedWithoutView instanceof User);
  t.is(userParsedWithoutView.id, 1);
  t.is(userParsedWithoutView.email, 'john.alfa@gmail.com');
  t.is(userParsedWithoutView.password, 'rtJ9FrqP!rCE');
  t.is(userParsedWithoutView.firstname, 'John');
  t.is(userParsedWithoutView.lastname, 'Alfa');
  t.is(userParsedWithoutView.activationCode, '75afe654-695e-11ea-bc55-0242ac130003');

  const jsonDataWithViewPublic = objectMapper.stringify<User>(user, {withViews: () => [Views.public]});
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithViewPublic), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}'));

  // eslint-disable-next-line max-len
  const userParsedWithViewPublic = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User],
    withViews: () => [Views.public]
  });
  t.assert(userParsedWithViewPublic instanceof User);
  t.is(userParsedWithViewPublic.id, 1);
  t.is(userParsedWithViewPublic.email, 'john.alfa@gmail.com');
  t.is(userParsedWithViewPublic.password, null);
  t.is(userParsedWithViewPublic.firstname, 'John');
  t.is(userParsedWithViewPublic.lastname, 'Alfa');
  t.is(userParsedWithViewPublic.activationCode, null);

  const jsonDataWithViewInternal = objectMapper.stringify<User>(user, {withViews: () => [Views.internal]});
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonDataWithViewInternal), JSON.parse('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}'));

  // eslint-disable-next-line max-len
  const userParsedWithViewInternal = objectMapper.parse<User>('{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}', {
    mainCreator: () => [User],
    withViews: () => [Views.internal]
  });
  t.assert(userParsedWithViewInternal instanceof User);
  t.is(userParsedWithViewInternal.id, 1);
  t.is(userParsedWithViewInternal.email, 'john.alfa@gmail.com');
  t.is(userParsedWithViewInternal.password, 'rtJ9FrqP!rCE');
  t.is(userParsedWithViewInternal.firstname, 'John');
  t.is(userParsedWithViewInternal.lastname, 'Alfa');
  t.is(userParsedWithViewInternal.activationCode, '75afe654-695e-11ea-bc55-0242ac130003');
});

test('@JsonView at parameter level', t => {
  class Company {
    @JsonProperty()
    name: string;
    @JsonProperty()
    @JsonClassType({type: () => [Array, [Employee]]})
    employees: Employee[] = [];

    constructor(name: string,
      @JsonView({value: () => [Views.internal]})
      @JsonClassType({type: () => [Array, [Employee]]}) employees: Employee[] ) {
      this.name = name;
      this.employees = employees;
    }
  }

  class Employee {
    @JsonProperty()
    name: string;
    @JsonProperty()
    age: number;

    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
  }

  const employee = new Employee('John Alfa', 25);
  const company = new Company('Google', [employee]);

  const objectMapper = new ObjectMapper();

  const jsonData = objectMapper.stringify<Company>(company);
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"employees":[{"name":"John Alfa","age":25}],"name":"Google"}'));

  const companyParsed = objectMapper.parse<Company>(jsonData, {
    mainCreator: () => [Company],
    withViews: () => [Views.public]
  });
  t.assert(companyParsed instanceof Company);
  t.is(companyParsed.name, 'Google');
  t.is(companyParsed.employees, null);
});
