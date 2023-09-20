import * as chai from 'chai';
import { UserFilterField, UserType } from './usage.model';
import { DateTime } from "luxon";
import { Criteria } from "@dqljs/query";
import { UserService } from "./usage.service";

const expect = chai.expect;

describe('DQL library', () => {

    it('service usage' , () => {
        const s = new UserService()
        const filterResult = s.listUsers({
            filter: (user) => user.type.eq(UserType.GENERAL)
        })
        expect(filterResult).to.equal(`type:eq:"GENERAL"`)
    });

    it('filter demonstration' , () => {
        const f = new UserFilterField()
        const c = f.creationTime.before(DateTime.fromISO("2020-01-01T00:00:00.000Z")).not().and(f.type.eq(UserType.ADMIN).or(f.name.containsIgnoreCase("a"))).and(f.enabled).and(f.heightCm.goe(160).and(f.heightCm.lt(120.5)))
        const dql = Criteria.toDqlString(c)
        expect(dql).to.equal(`!creationTime:before:"2020-01-01T00:00:00.000Z"&(type:eq:"ADMIN"|name:containsIgnoreCase:"a")&enabled:isTrue&(heightCm:goe:160&heightCm:lt:120.5)`)
    });

    it('grouping by operator precedence' , () => {
        const f = new UserFilterField()
        const a = f.name.eq("a")
        const b = f.name.eq("b")
        const c = f.name.eq("c")
        expect(Criteria.toDqlString(a.or(b).and(c))).to.equal(`(name:eq:"a"|name:eq:"b")&name:eq:"c"`)
        expect(Criteria.toDqlString(a.and(b).or(c))).to.equal(`name:eq:"a"&name:eq:"b"|name:eq:"c"`)
        expect(Criteria.toDqlString(a.and(b).not().or(c))).to.equal(`!(name:eq:"a"&name:eq:"b")|name:eq:"c"`)
        expect(Criteria.toDqlString(a.or(b.and(c)))).to.equal(`name:eq:"a"|name:eq:"b"&name:eq:"c"`)
        expect(Criteria.toDqlString(a.or(b.and(c).not()))).to.equal(`name:eq:"a"|!(name:eq:"b"&name:eq:"c")`)
    });

});
