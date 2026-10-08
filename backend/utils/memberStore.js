const { getDb, nextId, strip } = require('../config/db');
const { rankCategory } = require('./ranks');

const col = () => getDb().collection('members');

function memberNumber(id) {
  return 'NNPA/MBR/' + String(id).padStart(5, '0');
}

// service numbers get typed many ways (NN/1234, nn 1234, NN-1234) — compare on letters+digits only
function normServiceNo(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function clean(v) {
  return typeof v === 'string' ? v.trim() : v;
}

async function listMembers() {
  const docs = await col().find({}).toArray();
  return docs.map(strip);
}

async function getMember(id) {
  return strip(await col().findOne({ id: Number(id) }));
}

async function findByServiceNo(serviceNo, exceptId) {
  const key = normServiceNo(serviceNo);
  if (!key) return null;
  const doc = await col().findOne({ serviceNoKey: key });
  if (!doc || doc.id === exceptId) return null;
  return strip(doc);
}

function withComputed(member) {
  return Object.assign({}, member, { rankCategory: rankCategory(member.rank) });
}

// inserts a new member. throws err.code === 'DUPLICATE_SERVICE_NO' if the number is taken
async function createMember(data, opts) {
  opts = opts || {};
  const dup = await findByServiceNo(data.serviceNo);
  if (dup) {
    const err = new Error('Service number already on the register (' + dup.fullName + ', ' + dup.memberNo + ')');
    err.code = 'DUPLICATE_SERVICE_NO';
    err.existing = dup;
    throw err;
  }

  const now = new Date().toISOString();
  const id = await nextId('members');
  const rank = clean(data.rank);
  const actor = opts.actor || 'system';
  const member = {
    id,
    memberNo: memberNumber(id),
    createdAt: now,
    updatedAt: now,
    source: opts.source || 'secretariat',
    applicationId: opts.applicationId || null,
    fullName: clean(data.fullName),
    dateOfBirth: clean(data.dateOfBirth) || '',
    sex: clean(data.sex) || '',
    serviceNo: clean(data.serviceNo),
    rank,
    command: clean(data.command) || '',
    serviceStatus: data.serviceStatus === 'retired' ? 'retired' : 'serving',
    membershipTier: clean(data.membershipTier) || '',
    email: clean(data.email) || '',
    phone: clean(data.phone) || '',
    address: clean(data.address) || '',
    notes: clean(data.notes) || '',
    status: opts.status || 'active',
    rankHistory: [{ rank, effectiveDate: data.rankDate || now.slice(0, 10), recordedAt: now, recordedBy: actor }],
    activity: [{
      at: now, by: actor,
      text: opts.source === 'online-application'
        ? 'Record created from online membership application'
        : 'Record created by secretariat'
    }]
  };

  try {
    await col().insertOne(Object.assign({ serviceNoKey: normServiceNo(member.serviceNo) }, member));
  } catch (e) {
    if (e && e.code === 11000) {   // lost a race with a simultaneous signup of the same service number
      const err = new Error('Service number already on the register');
      err.code = 'DUPLICATE_SERVICE_NO';
      throw err;
    }
    throw e;
  }
  return member;
}

// saves an edited member back (whole record, keeps the service-number key in step)
async function saveMember(member) {
  try {
    await col().replaceOne(
      { id: member.id },
      Object.assign({ serviceNoKey: normServiceNo(member.serviceNo) }, member)
    );
  } catch (e) {
    if (e && e.code === 11000) {
      const err = new Error('Service number already belongs to another member');
      err.code = 'DUPLICATE_SERVICE_NO';
      throw err;
    }
    throw e;
  }
  return member;
}

// called when a naval-personnel application comes in. never throws — a problem here
// must not stop the application itself from being saved.
async function enrolFromApplication(application) {
  try {
    const member = await createMember({
      fullName: application.fullName,
      dateOfBirth: application.dateOfBirth,
      sex: application.sex,
      serviceNo: application.serviceNo,
      rank: application.rank,
      command: application.command,
      serviceStatus: application.serviceStatus,
      membershipTier: application.tier,
      email: application.email,
      phone: application.phone,
      address: application.address,
      notes: ''
    }, { source: 'online-application', applicationId: application.id, status: 'pending', actor: 'applicant' });
    return { created: true, id: member.id, memberNo: member.memberNo };
  } catch (err) {
    if (err.code === 'DUPLICATE_SERVICE_NO' && err.existing) {
      return { created: false, duplicateOf: err.existing.id, memberNo: err.existing.memberNo };
    }
    console.error('Could not enrol member from application', application.id, err);
    return { created: false, error: err.message };
  }
}

module.exports = {
  listMembers, getMember, findByServiceNo, createMember, saveMember,
  withComputed, enrolFromApplication, memberNumber, normServiceNo
};
