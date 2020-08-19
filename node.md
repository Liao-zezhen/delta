diff_main
检查相同 [[0, text1]]

    find_cursor_edit_diff
        make_edit_splice
        remove_empty_tuples
    指定光标：新旧值的前后缀需要一致，然后找出不同 [[0, before], [-1, oldMiddle], [1, newMiddle], [0, after]]
        editBefore
            以 newCursor(oldCursor + newLength - oldLength) 分割后缀，比较后缀；
            以 min(oldCursor, newcursor) 分割前缀，比较前缀；
        editAfter
            以 oldCursor 分割前缀，比较前缀；
            以 min(oldLength - oldCursor, newLength - oldCurosr) 分割后缀（从后算起），比较后缀；

    diff_commonPrefix
    找出相同的前缀 commonprefix
    diff_commonSuffix
    找出相同的后缀 commonsuffix

    diff_compute_
    将排除相同前后缀的文本作比较 [[0, commonprefix], diff_compute, [0, commonsuffix]]
        不存在文本一 [[1, text2]]
        不存在文本二 [[-1, text1]]
        
        长文本包含整个短文本
        短文本只有一个字符 [[-1, text1], [1, text2]]
        
        diff_halfMatch_
            diff_halfMatchI_
        快速找出至少大于长文本一半长度的相同字符 [diffs_a: diff_main(text1_a, text2_a), [0, mid_common], diffs_b: diff_main(text1_b, text2_b)]

        diff_bisect_
            diff_bisectSplit_
        使用Myers算法从字符串两头分别查找前后碰头的索引，以此分割 [diffs: diff_main(text1a, text2a), diffsb: diff_main(text1b, text2b)]

    diff_cleanupMerge
    进行合并排序

is_surrogate_pair_start
is_surrogate_pair_end
starts_with_pair_end
ends_with_pair_start
