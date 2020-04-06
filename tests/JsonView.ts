import test from 'ava';
import {JsonView} from '../src/decorators/JsonView';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

class Views {
  static public = class Public {};
  static internal = class Internal {};
}

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

  constructor(id: number, email: string, password: string, firstname: string, lastname: string, activationCode: string) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstname = firstname;
    this.lastname = lastname;
    this.activationCode = activationCode;
  }
}

test('@JsonView', t => {
  const password = 'rtJ9FrqP!rCE';
  const activationCode = '75afe654-695e-11ea-bc55-0242ac130003';
  const user = new User(1, 'john.alfa@gmail.com', password, 'John', 'Alfa', activationCode);

  const objectMapper = new ObjectMapper();

  const jsonDataWithoutView = objectMapper.stringify<User>(user);
  // eslint-disable-next-line max-len
  t.is(jsonDataWithoutView, '{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}');

  const jsonDataWithViewPublic = objectMapper.stringify<User>(user, {withViews: () => [Views.public]});
  t.is(jsonDataWithViewPublic, '{"id":1,"email":"john.alfa@gmail.com","firstname":"John","lastname":"Alfa"}');

  const jsonDataWithViewInternal = objectMapper.stringify<User>(user, {withViews: () => [Views.internal]});
  // eslint-disable-next-line max-len
  t.is(jsonDataWithViewInternal, '{"id":1,"email":"john.alfa@gmail.com","password":"rtJ9FrqP!rCE","firstname":"John","lastname":"Alfa","activationCode":"75afe654-695e-11ea-bc55-0242ac130003"}');
});
