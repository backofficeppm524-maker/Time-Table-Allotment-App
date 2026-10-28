import json

DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
CLASSES = ['cls-11-a', 'cls-11-b', 'cls-11-c', 'cls-11-d', 'cls-11-e',
           'cls-12-a', 'cls-12-b', 'cls-12-c', 'cls-12-d', 'cls-12-e']

# Grid: [day_idx][period_idx][class_name] -> slot_info
grid = [[{} for _ in range(8)] for _ in range(5)]
teacher_grid = [[{} for _ in range(8)] for _ in range(5)]

def set_cell(d_idx, p_idx, c_id, sub_id, t_id, label, is_comb=False):
    day = DAYS[d_idx]
    period = p_idx + 1
    
    # Check class collision
    if c_id in grid[d_idx][p_idx]:
        existing = grid[d_idx][p_idx][c_id]
        raise Exception(f"Class collision for {c_id} at {day} P{period}: already has {existing['sub_id']}, trying {sub_id}")
    
    # Check teacher collision
    if t_id:
        if t_id in teacher_grid[d_idx][p_idx]:
            existing_t = teacher_grid[d_idx][p_idx][t_id]
            # If both are part of the same combined group, it's allowed!
            if not (is_comb and existing_t.get('is_comb') and existing_t.get('label') == label):
                raise Exception(f"Teacher collision for {t_id} at {day} P{period}: already teaching {existing_t['c_id']} ({existing_t['label']}), trying {c_id} ({label})")
        else:
            teacher_grid[d_idx][p_idx][t_id] = {'c_id': c_id, 'sub_id': sub_id, 'label': label, 'is_comb': is_comb}

    grid[d_idx][p_idx][c_id] = {
        'classId': c_id,
        'day': day,
        'period': period,
        'subjectId': sub_id,
        'teacherId': t_id,
        'isCombined': is_comb,
        'combinedLabel': label,
    }

def set_group(d_idx, p_idx, c_ids, sub_id, t_id, label):
    for cid in c_ids:
        set_cell(d_idx, p_idx, cid, sub_id, t_id, label, is_comb=True)

# 1. Subbulakshmi: Tamil (29 periods)
# 11ABC (5): Mon-Fri P1
for d in range(5):
    set_group(d, 0, ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'sub-tam', 't-subbulakshmi', '11A,B,C')
# 12ABC (5): Mon-Fri P4
for d in range(5):
    set_group(d, 3, ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'sub-tam', 't-subbulakshmi', '12A,B,C')
# 11D (5): Mon-Fri P5
for d in range(5):
    set_cell(d, 4, 'cls-11-d', 'sub-tam', 't-subbulakshmi', '11D')
# 12D (5): Mon-Fri P7
for d in range(5):
    set_cell(d, 6, 'cls-12-d', 'sub-tam', 't-subbulakshmi', '12D')
# 11E (4): Mon-Thu P2
for d in range(4):
    set_cell(d, 1, 'cls-11-e', 'sub-tam', 't-subbulakshmi', '11E')
# 12E (5): Mon-Fri P8
for d in range(5):
    set_cell(d, 7, 'cls-12-e', 'sub-tam', 't-subbulakshmi', '12E')

# 2. Pradeepa: English (29 periods)
# 11ABC (5): Mon-Fri P2
for d in range(5):
    set_group(d, 1, ['cls-11-a', 'cls-11-b', 'cls-11-c'], 'sub-eng', 't-pradeepa', '11A,B,C')
# 12ABC (5): Mon-Fri P5
for d in range(5):
    set_group(d, 4, ['cls-12-a', 'cls-12-b', 'cls-12-c'], 'sub-eng', 't-pradeepa', '12A,B,C')
# 11D (5): Mon-Fri P6
for d in range(5):
    set_cell(d, 5, 'cls-11-d', 'sub-eng', 't-pradeepa', '11D')
# 12D (5): Mon-Fri P8
for d in range(5):
    set_cell(d, 7, 'cls-12-d', 'sub-eng', 't-pradeepa', '12D')
# 11E (4): Mon, Tue, Wed, Fri P1
for d in [0, 1, 2, 4]:
    set_cell(d, 0, 'cls-11-e', 'sub-eng', 't-pradeepa', '11E')
# 12E (5): Mon-Fri P7
for d in range(5):
    set_cell(d, 6, 'cls-12-e', 'sub-eng', 't-pradeepa', '12E')

print("Tamil & English placed cleanly!")
