"""Independent fixtures explicitly preserve every multi-record proof combination."""

import copy
from itertools import combinations

import pytest

from witness.case import blank_draft, score

# Full combinations and partial combinations are copied from the approved rubric, not implementation data.
PROOF = {
    "D01": ("delayed", {"event": "E03", "procedure": "E04", "state": "E05"}, {"event", "procedure"}, 15, 8),
    "D02_timing": ("check", {"state": "E05", "boundary": "E06"}, {"state"}, 15, 8),
    "D02_return": ("not_returned", {"account": "E04", "state": "E05", "closure": "E06"}, {"account", "state"}, 10, 5),
    "D03": ("maya", {"timing": "E05", "access": "E06", "identity": "E08"}, {"access", "identity"}, 25, 10),
    "D04": ("cart", {"movement": "E08", "location": "E11"}, {"location"}, 15, 7),
    "D05": ("response", {"notification": "E03", "entry": "E07", "timing": "E05"}, {"notification", "entry"}, 5, 2),
    "D06": ("skipped", {"procedure": "E04", "execution": "E10", "timing": "E05"}, {"procedure", "execution"}, 5, 2),
    "D07": ("sale", {"purpose": "E12", "connection": "E11"}, {"purpose"}, 10, 5),
}


def complete_draft(keys=None):
    draft = blank_draft()
    for key in keys or PROOF:
        choice, records, *_ = PROOF[key]
        draft["fields"][key] = {"choice": choice, "citations": records.copy()}
    return draft


SUBSETS = [(key, set(subset)) for key, (_, roles, *_) in PROOF.items()
           for size in range(len(roles) + 1) for subset in combinations(roles, size)]


@pytest.mark.parametrize("key,supported", SUBSETS)
def test_every_full_partial_and_other_support_combination(key, supported):
    choice, roles, partial, full_points, partial_points = PROOF[key]
    draft = blank_draft()
    draft["fields"][key] = {"choice": choice, "citations": {role: record if role in supported else None for role, record in roles.items()}}
    expected = full_points if supported == set(roles) else partial_points if supported == partial else 0
    assert score(draft)["total"] == expected
    # Irrelevant IDs in unsupported roles do not erase valid partial support.
    for role in set(roles) - supported:
        draft["fields"][key]["citations"][role] = "E01"
    assert score(draft)["total"] == expected


@pytest.mark.parametrize("key", PROOF)
def test_claim_requires_the_complete_multi_record_roles(key):
    draft = complete_draft([key])
    roles = list(PROOF[key][1])
    assert len(roles) in {2, 3}
    assert score(draft)["total"] == PROOF[key][3]
    # A claim-wide single citation cannot satisfy two or three independent roles.
    selected = next(iter(PROOF[key][1].values()))
    draft["fields"][key]["citations"] = {role: selected for role in roles}
    assert score(draft)["total"] < PROOF[key][3]


@pytest.mark.parametrize("key", PROOF)
def test_source_identity_and_role_assignment_are_both_required(key):
    draft = complete_draft([key])
    roles = list(PROOF[key][1])
    values = list(PROOF[key][1].values())
    draft["fields"][key]["citations"] = dict(zip(roles, values[1:] + values[:1]))
    assert score(draft)["total"] == 0


def test_worked_scores_and_core_gates():
    assert score(complete_draft())["total"] == 100
    assert score(complete_draft())["core_proof"] is True
    assert score(complete_draft(["D01", "D02_timing", "D03", "D02_return", "D04"]))["total"] == 80
    assert score(complete_draft(["D01", "D02_timing", "D03", "D02_return"]))["total"] == 65
    wrong = complete_draft()
    wrong["fields"]["D03"]["choice"] = "alex"
    result = score(wrong)
    assert (result["total"], result["core_proof"], result["accusation"]) == (75, False, "Accusation unsupported")
    assert result["outcome"] == "Incomplete reconstruction"
    partial = complete_draft()
    for key, (_, roles, support, *_) in PROOF.items():
        partial["fields"][key]["citations"] = {role: record if role in support else None for role, record in roles.items()}
    assert score(partial)["total"] == 47
    assert score(partial)["core_proof"] is False


def test_guess_and_prose_cannot_replace_support():
    draft = complete_draft()
    for claim in draft["fields"].values():
        claim["citations"] = {key: None for key in claim["citations"]}
    draft["explanation"] = "The real culprit is Maya. I know the exact sensor second."
    assert score(draft)["total"] == 0
    assert score(blank_draft())["total"] == 0


def test_return_account_requires_written_obligation():
    draft = complete_draft(["D02_return"])
    draft["fields"]["D02_return"]["citations"]["account"] = "E02"
    assert score(draft)["total"] == 0
